#!/usr/bin/env bash
# Gera as fotos do site (assets/img/work/) a partir das fotos que o Jean mandou pelo WhatsApp (15/10).
# Cada foto sai em WebP em dois tamanhos (lado maior com 800 e 1600 px), sem os dados EXIF (local, aparelho).
#
# Uso: bash tools/make-images.sh /pasta/da/conversa/exportada    (precisa de ImageMagick e ffmpeg)
#
# Para trocar ou acrescentar uma foto: ponha uma linha na lista abaixo (número do arquivo do WhatsApp | nome)
# e use o mesmo nome no index.html.

set -euo pipefail
SRC=${1:?"Informe a pasta com as fotos do WhatsApp (ex.: bash tools/make-images.sh ~/Downloads/WhatsApp)"}
SRC=$(cd "$SRC" && pwd)
cd "$(dirname "$0")/.."

OUT=assets/img/work
mkdir -p "$OUT"

PHOTOS=(
  # Iluminados e neon
  "0165|masq-halo-lit"
  "0164|masq-brass"
  "0177|tooleys-letters"
  "0158|grab-and-go-neon"
  "0162|good-vibes-neon"
  "0157|piece-of-velvet"
  "0178|neon-on-moss"
  "0185|nineteen-moss"
  "0181|china-white"
  "0189|ashtons-lightbox"
  "0155|grab-burger-logo"
  "0186|partido"
  # Fachadas
  "0175|tooleys-shopfront"
  "0173|get-fixed-night"
  "0149|salt-and-batter"
  "0171|salt-and-batter-hanging"
  "0151|duses-shopfront"
  "0163|suroor-market"
  "0168|chelsea-vet"
  "0169|vet-projecting-sign"
  "0188|peckham-levels"
  # Veículos
  "0204|erlis-van"
  "0205|erlis-rear"
  "0206|erlis-truck"
  "0207|ecoglow-buzz"
  "0208|ecoglow-van"
  "0209|blue-bonnet"
  "0203|half-wrapped-van"
  "0202|nunhead-van"
  "0148|ev-car-wrap"
  "0145|evri-cargo-bike"
  "0187|ryde-cargo-bike"
  "0141|fedex-cargo-bike"
  "0135|delivery-mates-bike"
  "0139|fittest-couriers-bike"
  "0138|petals-bike"
  # Paredes e interiores
  "0167|zeus-grab-and-go"
  "0160|zeus-mural"
  "0172|choose-your-model"
  "0140|our-story-wall"
  "0179|brick-wall-drawing"
  # Impressão em grande formato
  "0143|shift-collect-row"
  "0142|shift-collect"
  "0161|newhomes-hoarding"
  "0184|steak-window"
  # Oficina
  "0146|green-letters-workshop"
  "0152|grab-burger-letters"
  "0182|red-letter-workshop"
)

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

for p in "${PHOTOS[@]}"; do
  IFS='|' read -r n slug <<< "$p"
  f=$(ls "$SRC"/0000"$n"-PHOTO-*.jpg 2> /dev/null | head -1 || true)
  if [[ -z $f ]]; then
    echo "!! foto $n não encontrada em $SRC" >&2
    exit 1
  fi
  for w in 800 1600; do
    convert "$f" -auto-orient -strip -resize "${w}x${w}>" -quality 95 "$TMP/a.jpg"
    ffmpeg -nostdin -v error -y -i "$TMP/a.jpg" -c:v libwebp -quality 76 -compression_level 6 "$OUT/$slug-$w.webp"
  done
  echo "· $slug ($(basename "$f"))"
done

du -sh "$OUT"
