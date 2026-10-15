#!/usr/bin/env bash
# Monta o vídeo do topo do site (assets/video/) a partir de clipes curtos, com a mesma cor em todos.
#
# Hoje são 3 clipes gratuitos, só de piso (uso comercial liberado, sem crédito obrigatório):
#   01 light  sol sobre piso de carvalho          Coverr  https://coverr.co/videos/a-shadow-on-a-wooden-floor-04otusifny
#   02 room   câmera passando pela sala vazia     Coverr  https://coverr.co/videos/empty-room-with-a-window-peegts0hp9
#   03 grain  câmera rente aos veios da madeira   Mixkit  https://mixkit.co/free-stock-video/detailed-tour-of-the-surface-of-a-wooden-board-34496/
# Licenças: Coverr License e Mixkit Stock Video Free License.
#
# Para usar as filmagens do Gabriel (ou um vídeo gerado, veja tools/PROMPTS.md): grave clipes deitados
# (1920x1080 ou maior), coloque em tools/clips/ e troque a lista CLIPS abaixo. Cada linha é:
#   nome | arquivo ou URL | segundo onde o trecho começa | duração do trecho | centro do recorte em pé (0 = esquerda, 1 = direita) | recorte opcional
# O recorte opcional (largura:altura:x:y, em pixels do vídeo original) serve para tirar algo do quadro,
# como o sapato que aparece embaixo no clipe do sol e o ventilador de teto no clipe da sala.
#
# Uso: bash tools/make-hero-video.sh        (precisa de ffmpeg e curl)

set -euo pipefail
cd "$(dirname "$0")/.."

OUT=assets/video
XF=0.6     # fusão entre um clipe e o próximo
EDGE=0.4   # escurece no começo e no fim, para o loop não dar pulo
# Cor: menos saturação, um tom quente e os brancos (janela, sol no piso) mais baixos, para o texto do topo ler bem
GRADE="eq=saturation=0.66:contrast=1.05:gamma=0.96,colorbalance=rs=-0.01:bs=0.02:rh=0.04:bh=-0.04,curves=master='0/0 0.5/0.47 0.8/0.66 1/0.8'"

CLIPS=(
  "light|https://cdn.coverr.co/videos/coverr-a-shadow-on-a-wooden-floor-2090/1080p.mp4|2.0|4.5|0.50|1240:698:340:0"
  "room|https://cdn.coverr.co/videos/coverr-empty-room-with-a-window-8154/1080p.mp4|3.0|6.8|0.35|1632:918:144:162"
  "grain|https://assets.mixkit.co/videos/34496/34496-1080.mp4|0.5|4.5|0.50"
)

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$OUT" tools/clips

n=${#CLIPS[@]}
DURS=()
for ((i = 0; i < n; i++)); do
  IFS='|' read -r name src start dur cx crop <<< "${CLIPS[$i]}"
  name=$(echo "$name" | xargs); src=$(echo "$src" | xargs); start=$(echo "$start" | xargs); dur=$(echo "$dur" | xargs)
  cx=$(echo "$cx" | xargs); crop=$(echo "${crop:-}" | xargs)
  DURS+=("$dur")
  if [[ $src == http* ]]; then
    f="tools/clips/$name-$(basename "$src")"
    [[ -f $f ]] || curl -fsSL -o "$f" "$src"
  else
    f="$src"
  fi
  echo "· $name ($f, de ${start}s, ${dur}s)"
  # Deitado: 24 fps, 1920x1080, cor do site
  ffmpeg -nostdin -v error -y -ss "$start" -t "$dur" -i "$f" -an \
    -vf "fps=24,${crop:+crop=$crop,}scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,setsar=1,$GRADE,format=yuv420p" \
    -c:v libx264 -crf 10 -preset veryfast "$WORK/wide_$i.mp4"
  # Em pé (celular): recorte 9:16 em volta de cx
  x=$(awk -v c="$cx" 'BEGIN { x = c * 1920 - 304; if (x < 0) x = 0; if (x > 1312) x = 1312; printf "%d", x }')
  ffmpeg -nostdin -v error -y -i "$WORK/wide_$i.mp4" -an \
    -vf "crop=608:1080:$x:0,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p" \
    -c:v libx264 -crf 10 -preset veryfast "$WORK/tall_$i.mp4"
done

# Duração total: soma dos trechos menos as fusões
TOTAL=$(printf '%s\n' "${DURS[@]}" | awk -v x="$XF" '{ s += $1; c++ } END { print s - (c - 1) * x }')

join() { # $1 = wide|tall
  local inputs=() filter="" prev="[0:v]" off=0 total="$TOTAL"
  for ((k = 0; k < n; k++)); do inputs+=(-i "$WORK/$1_$k.mp4"); done
  for ((k = 1; k < n; k++)); do
    off=$(awk -v o="$off" -v d="${DURS[$((k - 1))]}" -v x="$XF" 'BEGIN { print o + d - x }')
    filter+="${prev}[$k:v]xfade=transition=fade:duration=$XF:offset=$off[v$k];"
    prev="[v$k]"
  done
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
echo "Vídeo pronto: ${TOTAL} s em loop"
ls -la "$OUT"
