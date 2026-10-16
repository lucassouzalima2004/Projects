#!/usr/bin/env bash
# Monta o vídeo do topo (assets/video/) com as fotos dos letreiros iluminados do Jean:
# cada foto entra com um zoom lento (efeito "Ken Burns") e funde na próxima.
#
# Saem dois vídeos (cada um em MP4 e WebM): um deitado para o computador (1920x1080) e um em pé para o celular (720x1280),
# cada um com a sua lista de fotos, e uma imagem de capa de cada (mostrada enquanto o vídeo carrega).
# As legendas que aparecem no canto do vídeo ("Now showing") ficam no index.html, no atributo
# data-reel de cada <source>: mantenha a mesma ordem das listas abaixo.
#
# Cada linha da lista é:  foto (de assets/img/work, sem o -1600.webp) | centro do recorte na horizontal (0 a 1) | na vertical | zoom: in ou out
#
# Uso: bash tools/make-hero-video.sh   (precisa de ffmpeg; rode antes o tools/make-images.sh)

set -euo pipefail
cd "$(dirname "$0")/.."

OUT=assets/video
IMG=assets/img/work
FPS=30
DUR=2.6    # tempo de cada foto, contando a fusão
XF=0.6     # fusão entre uma foto e a próxima
EDGE=0.35  # escurece no começo e no fim, para o loop não dar pulo
ZOOM=0.10  # quanto cada foto aproxima (ou afasta) durante o tempo dela

WIDE=(
  "good-vibes-neon|0.50|0.52|in"
  "masq-halo-lit|0.50|0.45|out"
  "tooleys-letters|0.50|0.52|in"
  "grab-and-go-neon|0.56|0.32|out"
  "piece-of-velvet|0.50|0.50|in"
  "get-fixed-night|0.52|0.40|out"
  "neon-on-moss|0.50|0.50|in"
  "green-letters-workshop|0.62|0.45|out"
)
TALL=(
  "grab-burger-logo|0.50|0.50|in"
  "good-vibes-neon|0.42|0.50|out"
  "china-white|0.50|0.50|in"
  "grab-and-go-neon|0.43|0.50|out"
  "nineteen-moss|0.50|0.50|in"
  "masq-halo-lit|0.50|0.50|out"
  "get-fixed-night|0.46|0.50|in"
  "neon-on-moss|0.56|0.50|out"
)

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$OUT"

FRAMES=$(awk -v d="$DUR" -v f="$FPS" 'BEGIN { printf "%d", d * f }')

render() { # $1 = wide|tall  $2 = largura  $3 = altura  depois: as linhas da lista
  local kind=$1 W=$2 H=$3; shift 3
  local list=("$@") n=${#list[@]} k
  for ((k = 0; k < n; k++)); do
    IFS='|' read -r slug fx fy dir <<< "${list[$k]}"
    local src="$IMG/$slug-1600.webp"
    [[ -f $src ]] || { echo "!! falta $src (rode tools/make-images.sh)" >&2; exit 1; }
    # Recorte na proporção do vídeo, em volta do centro escolhido
    local crop="crop='min(iw,ih*$W/$H)':'min(ih,iw*$H/$W)':'max(0,min(iw-ow,iw*$fx-ow/2))':'max(0,min(ih-oh,ih*$fy-oh/2))'"
    local z
    if [[ $dir == in ]]; then z="1+$ZOOM*on/($FRAMES-1)"; else z="1+$ZOOM-$ZOOM*on/($FRAMES-1)"; fi
    # Amplia 4x antes do zoom: assim o movimento sai liso, sem tremer
    ffmpeg -nostdin -v error -y -i "$src" -an \
      -vf "$crop,scale=$((W * 4)):$((H * 4)):flags=lanczos,zoompan=z='$z':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=$FRAMES:s=${W}x${H}:fps=$FPS,eq=contrast=1.05:saturation=1.06,setsar=1,format=yuv420p" \
      -frames:v "$FRAMES" -c:v libx264 -crf 12 -preset veryfast "$WORK/${kind}_$k.mp4"
    echo "· $kind $((k + 1))/$n  $slug"
  done

  local inputs=() filter="" prev="[0:v]" off=0
  for ((k = 0; k < n; k++)); do inputs+=(-i "$WORK/${kind}_$k.mp4"); done
  for ((k = 1; k < n; k++)); do
    off=$(awk -v k="$k" -v d="$DUR" -v x="$XF" 'BEGIN { print k * (d - x) }')
    filter+="${prev}[$k:v]xfade=transition=fade:duration=$XF:offset=$off[v$k];"
    prev="[v$k]"
  done
  local total
  total=$(awk -v n="$n" -v d="$DUR" -v x="$XF" 'BEGIN { print n * d - (n - 1) * x }')
  filter+="${prev}fade=t=in:st=0:d=$EDGE,fade=t=out:st=$(awk -v t="$total" -v e="$EDGE" 'BEGIN { print t - e }'):d=$EDGE,format=yuv420p[out]"

  ffmpeg -nostdin -v error -y "${inputs[@]}" -filter_complex "$filter" -map "[out]" -an \
    -c:v libx264 -crf 10 -preset veryfast "$WORK/${kind}_joined.mp4"
  # MP4 (H.264): toca em todos os navegadores, inclusive no iPhone
  ffmpeg -nostdin -v error -y -i "$WORK/${kind}_joined.mp4" -an \
    -c:v libx264 -profile:v high -crf "$CRF" -preset slow -g $((FPS * 2)) -movflags +faststart "$OUT/hero-$kind.mp4"
  # WebM (VP9): menor no Chrome e no Firefox, e toca nos navegadores sem H.264
  ffmpeg -nostdin -v error -y -i "$WORK/${kind}_joined.mp4" -an \
    -c:v libvpx-vp9 -crf "$VP9" -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -g $((FPS * 2)) "$OUT/hero-$kind.webm"
  # Capa: um quadro do meio da primeira foto
  ffmpeg -nostdin -v error -y -ss 1.1 -i "$OUT/hero-$kind.mp4" -frames:v 1 -q:v 3 "$OUT/hero-$kind.jpg"
  echo "  $OUT/hero-$kind.mp4  ${total}s  $(du -h "$OUT/hero-$kind.mp4" | cut -f1)  ·  webm $(du -h "$OUT/hero-$kind.webm" | cut -f1)"
}

CRF=27 VP9=38 render wide 1920 1080 "${WIDE[@]}"
CRF=26 VP9=36 render tall 720 1280 "${TALL[@]}"
