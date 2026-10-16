#!/usr/bin/env bash
# Monta os vídeos do topo do site (assets/video/) a partir de clipes curtos, com a mesma cor em todos.
#
# Uso:  bash tools/make-hero-video.sh              vídeo da página inicial (cozinhas)
#       bash tools/make-hero-video.sh commercial   vídeo da página Commercial
# (precisa de ffmpeg e curl)
#
# Clipes gratuitos (uso comercial liberado, sem crédito obrigatório; Coverr License e Mixkit Stock Video Free License):
#   Página inicial
#     kitchen  câmera deslizando por uma cozinha moderna    Coverr  https://coverr.co/videos/kitchen-in-a-house-ZpLPgHTn3m
#     timber   veios de madeira bem de perto                Mixkit  https://mixkit.co/free-stock-video/detailed-tour-of-the-surface-of-a-wooden-board-34496/
#     swatch   leque de cores sendo aberto                  Mixkit  https://mixkit.co/free-stock-video/architect-choosing-a-color-from-the-color-plate-21219/
#     marble   mármore branco bem de perto                  Mixkit  https://mixkit.co/free-stock-video/detailed-texture-of-a-smooth-marble-surface-34488/
#     bright   cozinha clara com bancada de pedra           Mixkit  https://mixkit.co/free-stock-video/interior-view-of-a-spacious-modern-kitchen-43033/
#   Commercial
#     dining   restaurante vazio com luz baixa              Mixkit  https://mixkit.co/free-stock-video/empty-restaurant-with-nice-lighting-29050/
#     hallway  corredor de hotel                            Mixkit  https://mixkit.co/free-stock-video/corridor-of-an-elegant-hotel-34613/
#     lift     elevador subindo num átrio dourado           Mixkit  https://mixkit.co/free-stock-video/elevator-inside-a-building-20827/
#     lobby    lobby com escada                             Mixkit  https://mixkit.co/free-stock-video/stairs-heading-up-through-a-large-hotel-29526/
#     office   escritório de vidro com mesa de madeira      Mixkit  https://mixkit.co/free-stock-video/modern-living-room-with-wooden-furniture-3090/
#
# Para usar vídeos da Bora Decor: grave clipes deitados (1920x1080 ou maior), coloque em tools/clips/
# e troque a lista do vídeo (CLIPS_HOME ou CLIPS_COMMERCIAL) abaixo. Cada linha é:
#   nome | arquivo ou URL | segundo onde o trecho começa | duração do trecho | centro do recorte em pé (0 = esquerda, 1 = direita)

set -euo pipefail
cd "$(dirname "$0")/.."

OUT=assets/video
XF=0.7     # fusão entre um clipe e o próximo
EDGE=0.5   # escurece no começo e no fim, para o loop não dar pulo
# Cor: menos saturação, tom quente (puxando para o dourado da marca) e brancos mais baixos, para o texto ler bem
GRADE="eq=saturation=0.72:contrast=1.06:gamma=0.95,colorbalance=rs=0.02:bs=-0.03:rm=0.03:bm=-0.03:rh=0.03:bh=-0.05,curves=master='0/0 0.5/0.46 0.8/0.68 1/0.82'"

CLIPS_HOME=(
  "kitchen|https://cdn.coverr.co/videos/coverr-kitchen-in-a-house-6113/1080p.mp4|0.3|5.5|0.30"
  "timber|https://assets.mixkit.co/videos/34496/34496-1080.mp4|0.5|4.0|0.50"
  "swatch|https://assets.mixkit.co/videos/21219/21219-720.mp4|3.0|4.0|0.55"
  "marble|https://assets.mixkit.co/videos/34488/34488-1080.mp4|1.0|4.0|0.50"
  "bright|https://assets.mixkit.co/videos/43033/43033-1080.mp4|1.0|5.0|0.40"
)
CLIPS_COMMERCIAL=(
  "dining|https://assets.mixkit.co/videos/29050/29050-720.mp4|1.0|4.2|0.45"
  "hallway|https://assets.mixkit.co/videos/34613/34613-720.mp4|0.3|4.0|0.50"
  "lift|https://assets.mixkit.co/videos/20827/20827-720.mp4|2.0|4.2|0.62"
  "lobby|https://assets.mixkit.co/videos/29526/29526-720.mp4|2.0|4.2|0.42"
  "office|https://assets.mixkit.co/videos/3090/3090-1080.mp4|1.0|4.4|0.45"
)

if [[ ${1:-} == commercial ]]; then
  CLIPS=("${CLIPS_COMMERCIAL[@]}"); NAME=commercial; BIG=no   # clipes em 720p: não vale gerar 1080
else
  CLIPS=("${CLIPS_HOME[@]}"); NAME=hero; BIG=yes
fi

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$OUT" tools/clips

n=${#CLIPS[@]}
DURS=()
for ((i = 0; i < n; i++)); do
  IFS='|' read -r name src start dur cx <<< "${CLIPS[$i]}"
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
    -vf "fps=24,scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,setsar=1,$GRADE,format=yuv420p" \
    -c:v libx264 -crf 12 -preset veryfast "$WORK/wide_$i.mp4"
  # Em pé (celular): recorte 9:16 em volta de cx
  x=$(awk -v c="$cx" 'BEGIN { x = c * 1920 - 304; if (x < 0) x = 0; if (x > 1312) x = 1312; printf "%d", x }')
  ffmpeg -nostdin -v error -y -i "$WORK/wide_$i.mp4" -an \
    -vf "crop=608:1080:$x:0,scale=720:1280:flags=lanczos,setsar=1,format=yuv420p" \
    -c:v libx264 -crf 12 -preset veryfast "$WORK/tall_$i.mp4"
done

# Duração total: soma dos trechos menos as fusões
TOTAL=$(printf '%s\n' "${DURS[@]}" | awk -v x="$XF" '{ s += $1; c++ } END { print s - (c - 1) * x }')

join() { # $1 = wide|tall
  local inputs=() filter="" prev="[0:v]" off=0
  for ((k = 0; k < n; k++)); do inputs+=(-i "$WORK/$1_$k.mp4"); done
  for ((k = 1; k < n; k++)); do
    off=$(awk -v o="$off" -v d="${DURS[$((k - 1))]}" -v x="$XF" 'BEGIN { print o + d - x }')
    filter+="${prev}[$k:v]xfade=transition=fade:duration=$XF:offset=$off[v$k];"
    prev="[v$k]"
  done
  filter+="${prev}fade=t=in:st=0:d=$EDGE,fade=t=out:st=$(awk -v t="$TOTAL" -v e="$EDGE" 'BEGIN { print t - e }'):d=$EDGE[out]"
  ffmpeg -nostdin -v error -y "${inputs[@]}" -filter_complex "$filter" -map "[out]" \
    -c:v libx264 -crf 12 -preset veryfast "$WORK/$1_joined.mp4"
}
join wide
join tall

# MP4 (H.264): toca em tudo, inclusive iPhone. +faststart para começar a tocar antes de baixar inteiro.
enc() { # entrada, saída, escala, crf
  ffmpeg -nostdin -v error -y -i "$1" -an -vf "scale=$3:flags=lanczos,format=yuv420p" \
    -c:v libx264 -profile:v high -crf "$4" -preset slow -tune film -g 48 -movflags +faststart "$2"
}
[[ $BIG == yes ]] && enc "$WORK/wide_joined.mp4" "$OUT/$NAME-1080.mp4" 1920:1080 27
enc "$WORK/wide_joined.mp4" "$OUT/$NAME-720.mp4"  1280:720  27
enc "$WORK/tall_joined.mp4" "$OUT/$NAME-tall.mp4" 720:1280  27

# WebM (VP9): para navegadores sem H.264 (ex.: Chromium em Linux). O site escolhe sozinho.
webm() { # entrada, saída, escala, crf
  ffmpeg -nostdin -v error -y -i "$1" -an -vf "scale=$3:flags=lanczos,format=yuv420p" \
    -c:v libvpx-vp9 -b:v 0 -crf "$4" -row-mt 1 -deadline good -cpu-used 4 -g 48 "$2"
}
webm "$WORK/wide_joined.mp4" "$OUT/$NAME-720.webm"  1280:720 38
webm "$WORK/tall_joined.mp4" "$OUT/$NAME-tall.webm" 720:1280 38

# Imagem que aparece enquanto o vídeo carrega (e para quem pediu "reduzir movimento")
ffmpeg -nostdin -v error -y -ss 1.2 -i "$WORK/wide_joined.mp4" -frames:v 1 -vf "scale=1600:900:flags=lanczos" -q:v 4 "assets/img/$NAME-poster.jpg"
ffmpeg -nostdin -v error -y -ss 1.2 -i "$WORK/tall_joined.mp4" -frames:v 1 -vf "scale=720:1280:flags=lanczos" -q:v 4 "assets/img/$NAME-poster-tall.jpg"

ls -la "$OUT"/$NAME-* assets/img/$NAME-poster*.jpg
echo "Duração: ${TOTAL}s"
