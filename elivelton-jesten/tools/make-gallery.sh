#!/usr/bin/env bash
# Fotos e vídeos que o cliente mandou pelo WhatsApp em 15/10/2026, já escolhidos (os repetidos e os desfocados ficaram
# de fora). Os originais ficam em tools/originals/whatsapp/ (fora do git, com o nome que o WhatsApp lhes deu).
# Cada foto sai em WebP com 480, 960 e 1440 px de largura, sem ampliar; cada vídeo, num trecho curto em H.264.
# No fim imprime largura, altura, tamanhos e cor média de cada um, para o src/content.js.
# Uso: bash tools/make-gallery.sh   (ONLY=photos ou ONLY=videos para refazer só uma parte)
set -euo pipefail
cd "$(dirname "$0")/.."
ORIG=tools/originals/whatsapp
IMG=public/assets/img/obras
VID=public/assets/video
mkdir -p "$IMG" "$VID"

# nome no site : número do anexo no WhatsApp
photos=(
  sc-betonagem:77 sc-cofragem:70 sc-laje:86
  dep-bomba:134 dep-laje:113 dep-laje-arranques:115 dep-laje-betonada:119 dep-grua:122 dep-armadura:125
  dep-cofragem:131 dep-cofragem-parede:133 dep-betonagem:137 dep-topo:142 dep-descofrado:145
  ind-fundacao:146 ind-armaduras:148 ind-arranques:155 ind-pedestais:157 ind-armacao:152 ind-verificacao:158 ind-escoramento:147
  frv-terras:100 frv-pilares:81 frv-estrutura:80
  posto-pavimento:48 posto-bombas:46 posto-valas:52 posto-tubagens:56 posto-fundacoes:60 posto-concluido:50
  muros-altos:102 muros-prontos:104
  remo-pavimento:63 remo-cobertura:66
  cat-balde:73
  tal-obra:180 tal-cofragem:178 tal-armacao:183
  sap-betonagem:172 sap-autobetoneira:173 sap-valas:174
  bomba-laje:185 bomba-nivelamento:187
  esc-sapatas:93
  alv-tijolo:62
  blocos-paredes:90 blocos-obra:89
  pt-estrutura:170 pt-laje-inclinada:171
)

# nome no site : número do anexo : início (s) : duração (s)
videos=(
  sc-bomba:166:12.5:10
  sc-armadura:167:1:10
  frv-grua:161:4:10
  alv-paredes:69:6:10
  betonagem-vibracao:194:16:10
  escoramento-laje:159:3:10
)

src_of() { ls "$ORIG"/"$(printf %08d "$1")"-"$2"-*; }

[ "${ONLY:-}" = videos ] && photos=()
[ "${ONLY:-}" = photos ] && videos=()

echo "# fotos: nome largura altura tamanhos cor"
for p in "${photos[@]}"; do
  name=${p%%:*}
  src=$(src_of "${p#*:}" PHOTO)
  read -r width height < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$src" | tr ',' ' ')
  sizes=()
  for w in 480 960 1440; do
    if [ "$w" -lt "$width" ]; then sizes+=("$w"); fi
  done
  # A maior versão é a própria largura do original quando ele não passa de 1440 px
  if [ "$width" -le 1440 ]; then sizes+=("$width"); fi
  for w in "${sizes[@]}"; do
    ffmpeg -v error -y -i "$src" -vf "scale=$w:-2:flags=lanczos" -c:v libwebp -quality 78 -compression_level 6 \
      -frames:v 1 "$IMG/$name-$w.webp"
  done
  big=${sizes[-1]}
  h=$(( (height * big / width + 1) / 2 * 2 ))
  rgb=$(ffmpeg -v error -i "$src" -vf "scale=1:1:flags=area,format=rgb24" -f rawvideo - | od -An -tu1 | tr -s ' ')
  printf '%s %s %s [%s] #%02x%02x%02x\n' "$name" "$big" "$h" "$(IFS=,; echo "${sizes[*]}")" $rgb
done

# Vídeos: trecho de 10 s, no tamanho do original (o WhatsApp já reduziu), 24 qps, sem som, H.264 com faststart
enc=(-c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart -an -g 48)
echo "# vídeos: nome largura altura cor"
for v in "${videos[@]}"; do
  IFS=: read -r name num start dur <<<"$v"
  src=$(src_of "$num" VIDEO)
  ffmpeg -v error -y -ss "$start" -t "$dur" -i "$src" -vf "fps=24,format=yuv420p" "${enc[@]}" -crf 28 "$VID/$name.mp4"
  ffmpeg -v error -y -i "$VID/$name.mp4" -frames:v 1 -c:v libwebp -quality 80 "$VID/$name.webp"
  read -r width height < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$VID/$name.mp4" | tr ',' ' ')
  rgb=$(ffmpeg -v error -i "$VID/$name.webp" -vf "scale=1:1:flags=area,format=rgb24" -f rawvideo - | od -An -tu1 | tr -s ' ')
  printf '%s %s %s #%02x%02x%02x\n' "$name" "$width" "$height" $rgb
done
