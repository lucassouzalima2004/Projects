#!/usr/bin/env bash
# Monta o vídeo do topo do site (assets/video/) a partir de clipes curtos, com a mesma cor em todos.
#
# Hoje são 4 clipes gratuitos do Mixkit, na licença "Mixkit Stock Video Free License"
# (uso comercial liberado, sem crédito obrigatório):
#   01 Measure  https://mixkit.co/free-stock-video/a-person-measures-a-block-of-wood-for-construction-1445/
#   02 Cut      https://mixkit.co/free-stock-video/man-in-a-carpentry-cutting-with-an-electric-saw-39699/
#   03 Fit      https://mixkit.co/free-stock-video/hand-of-a-carpenter-leveling-a-wooden-board-39684/
#   04 Finish   https://mixkit.co/free-stock-video/detailed-tour-of-the-surface-of-a-wooden-board-34496/
#
# Para usar as filmagens do Gabriel (ou um vídeo gerado): grave clipes deitados (1920x1080 ou maior),
# coloque em tools/clips/ e troque a lista CLIPS abaixo. Cada linha é:
#   nome | arquivo ou URL | segundo onde o trecho começa | centro do recorte em pé (0 = esquerda, 1 = direita) | recorte opcional
# O recorte opcional (largura:altura:x:y, em pixels do vídeo original) serve para tirar algo do quadro,
# como o logo grande da serra no clipe do corte.
# Se mudar a quantidade de clipes ou os nomes, ajuste também os capítulos no index.html (data-chapters do vídeo).
#
# Uso: bash tools/make-hero-video.sh        (precisa de ffmpeg e curl)

set -euo pipefail
cd "$(dirname "$0")/.."

OUT=assets/video
DUR=4      # segundos de cada clipe
XF=0.6     # fusão entre um clipe e o próximo
EDGE=0.4   # escurece no começo e no fim, para o loop não dar pulo
GRADE="eq=saturation=0.58:contrast=1.06:gamma=0.95,colorbalance=rs=-0.02:bs=0.03:rh=0.04:bh=-0.04"

CLIPS=(
  "measure|https://assets.mixkit.co/videos/1445/1445-1080.mp4|3.6|0.62"
  "cut|https://assets.mixkit.co/videos/39699/39699-1080.mp4|6.5|0.42|1382:777:0:303"
  "fit|https://assets.mixkit.co/videos/39684/39684-1080.mp4|1.0|0.45"
  "finish|https://assets.mixkit.co/videos/34496/34496-1080.mp4|0.5|0.50"
)

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$OUT" tools/clips

n=${#CLIPS[@]}
for ((i = 0; i < n; i++)); do
  IFS='|' read -r name src start cx crop <<< "${CLIPS[$i]}"
  name=$(echo "$name" | xargs); src=$(echo "$src" | xargs); start=$(echo "$start" | xargs); cx=$(echo "$cx" | xargs); crop=$(echo "${crop:-}" | xargs)
  if [[ $src == http* ]]; then
    f="tools/clips/$(basename "$src")"
    [[ -f $f ]] || curl -fsSL -o "$f" "$src"
  else
    f="$src"
  fi
  echo "· $name ($f, a partir de ${start}s)"
  # Deitado: 24 fps, 1920x1080, cor do site
  ffmpeg -nostdin -v error -y -ss "$start" -t "$DUR" -i "$f" -an \
    -vf "fps=24,${crop:+crop=$crop,}scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,setsar=1,$GRADE,format=yuv420p" \
    -c:v libx264 -crf 10 -preset veryfast "$WORK/wide_$i.mp4"
  # Em pé (celular): recorte 9:16 em volta de cx
  x=$(awk -v c="$cx" 'BEGIN { x = c * 1920 - 304; if (x < 0) x = 0; if (x > 1312) x = 1312; printf "%d", x }')
  ffmpeg -nostdin -v error -y -i "$WORK/wide_$i.mp4" -an \
    -vf "crop=608:1080:$x:0,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p" \
    -c:v libx264 -crf 10 -preset veryfast "$WORK/tall_$i.mp4"
done

join() { # $1 = wide|tall
  local inputs=() filter="" prev="[0:v]" off total
  for ((k = 0; k < n; k++)); do inputs+=(-i "$WORK/$1_$k.mp4"); done
  for ((k = 1; k < n; k++)); do
    off=$(awk -v d="$DUR" -v x="$XF" -v k="$k" 'BEGIN { print k * (d - x) }')
    filter+="${prev}[$k:v]xfade=transition=fade:duration=$XF:offset=$off[v$k];"
    prev="[v$k]"
  done
  total=$(awk -v d="$DUR" -v x="$XF" -v n="$n" 'BEGIN { print n * d - (n - 1) * x }')
  filter+="${prev}fade=t=in:st=0:d=$EDGE,fade=t=out:st=$(awk -v t="$total" -v e="$EDGE" 'BEGIN { print t - e }'):d=$EDGE[out]"
  ffmpeg -nostdin -v error -y "${inputs[@]}" -filter_complex "$filter" -map "[out]" \
    -c:v libx264 -crf 10 -preset veryfast "$WORK/$1_joined.mp4"
}
join wide
join tall

# Cada vídeo sai em MP4 (H.264, toca em tudo, inclusive iPhone) e em WebM (VP9, para navegadores sem H.264).
# O site escolhe sozinho o formato que o aparelho consegue tocar.
enc() { # $1 entrada, $2 saída sem extensão, $3 filtro de escala
  ffmpeg -nostdin -v error -y -i "$1" -an -vf "$3,format=yuv420p" \
    -c:v libx264 -preset slow -crf 27 -profile:v high -tune film -g 48 -movflags +faststart "$2.mp4"
  ffmpeg -nostdin -v error -y -i "$1" -an -vf "$3,format=yuv420p" \
    -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -deadline good -cpu-used 2 -g 48 "$2.webm"
}
enc "$WORK/wide_joined.mp4" "$OUT/hero-1080" "scale=1920:1080:flags=lanczos"
enc "$WORK/wide_joined.mp4" "$OUT/hero-720" "scale=1280:720:flags=lanczos"
enc "$WORK/tall_joined.mp4" "$OUT/hero-tall" "scale=720:1280:flags=lanczos"

# Primeiro quadro (já depois do escurecimento) para aparecer enquanto o vídeo carrega
ffmpeg -nostdin -v error -y -ss 0.9 -i "$WORK/wide_joined.mp4" -frames:v 1 -vf "scale=1600:-2:flags=lanczos" -c:v libwebp -quality 70 "$OUT/hero-poster.webp"
ffmpeg -nostdin -v error -y -ss 0.9 -i "$WORK/tall_joined.mp4" -frames:v 1 -vf "scale=720:-2:flags=lanczos" -c:v libwebp -quality 70 "$OUT/hero-poster-tall.webp"

echo
echo "Capítulos (segundos) para o data-chapters do vídeo no index.html:"
for ((k = 0; k < n; k++)); do
  IFS='|' read -r name _ <<< "${CLIPS[$k]}"
  awk -v d="$DUR" -v x="$XF" -v k="$k" -v nm="$(echo "$name" | xargs)" 'BEGIN { t = (k == 0) ? 0 : k * (d - x) + x / 2; printf "  %s %.2f\n", nm, t }'
done
awk -v d="$DUR" -v x="$XF" -v n="$n" 'BEGIN { printf "  duração total %.2f s\n", n * d - (n - 1) * x }'
ls -la "$OUT"
