#!/usr/bin/env bash
# Gera as fotos e os vídeos otimizados do site a partir dos originais do cliente.
#
#   bash tools/make-media.sh
#
# Os originais (fotos do Instagram e vídeos de obra do site antigo, jesten.pt) ficam em tools/originals/,
# que não vai para o git. Se a pasta estiver vazia, o script baixa os arquivos do site antigo.
# Precisa de ffmpeg com libx264 e libwebp.
set -euo pipefail
cd "$(dirname "$0")/.."

ORIG=tools/originals
IMG=public/assets/img/obras
VID=public/assets/video
mkdir -p "$ORIG" "$IMG" "$VID"

fetch() { # fetch <caminho no jesten.pt> <arquivo local>
  [ -s "$ORIG/$2" ] || curl -fsSL -o "$ORIG/$2" "https://jesten.pt/$1"
}
for i in 1 2 3 4 5 6 7; do fetch "assets/carrossel/jesten-$i.png" "jesten-$i.png"; done
fetch assets/carrossel/jesten-8.jpeg jesten-8.jpeg
for i in 1 2 3; do fetch "assets/videos/obra-$i.mp4" "obra-$i.mp4"; done

# Fotos: nome final e original. Cada uma sai em WebP com 480, 800, 1200 e 1600 px de largura, sem ampliar
# (uma foto de 1080 px sai em 480, 800 e 1080).
photos=(
  "laje-sant-cugat:jesten-1.png"
  "escavacao-grua:jesten-2.png"
  "armadura-fundacao:jesten-3.png"
  "cofragem-muros:jesten-4.png"
  "pilares-catalunha:jesten-5.png"
  "cofragem-pilar:jesten-6.png"
  "escoras-estaleiro:jesten-7.png"
  "fundacoes-grua:jesten-8.jpeg"
)
for p in "${photos[@]}"; do
  name=${p%%:*}; src=$ORIG/${p#*:}
  width=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$src")
  for w in 480 800 1200 1600; do
    if [ "$w" -gt "$width" ]; then
      [ "$w" -eq 1200 ] && w=$width || continue
    fi
    ffmpeg -v error -y -i "$src" -vf "scale=$w:-2:flags=lanczos" -c:v libwebp -quality 80 -compression_level 6 \
      -frames:v 1 "$IMG/$name-$w.webp"
  done
  # Cor média, usada de fundo enquanto a foto carrega
  rgb=$(ffmpeg -v error -i "$src" -vf "scale=1:1:flags=area,format=rgb24" -f rawvideo - | od -An -tu1 | tr -s ' ')
  printf '%-20s %s  #%02x%02x%02x\n' "$name" "$width" $rgb
done

# Vídeos: recorte 4:5 no tamanho original (576 px de largura; ampliar só aumenta o arquivo), 24 qps, sem som,
# H.264 com faststart. O "betonagem-loop" é o do topo do site e emenda o fim no começo (dissolve de 0,7 s)
# para o loop não dar pulo.
enc=(-c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart -an -g 48)

# Topo: betonagem (obra-1, 20,5 s a 29,7 s), recorte 576x720 a partir de y=150
ffmpeg -v error -y -ss 21.2 -t 8.5 -i "$ORIG/obra-1.mp4" -ss 20.5 -t 0.7 -i "$ORIG/obra-1.mp4" -filter_complex "\
  [0:v]crop=576:720:0:150,setpts=PTS-STARTPTS,fps=24[a];\
  [1:v]crop=576:720:0:150,setpts=PTS-STARTPTS,fps=24[b];\
  [a][b]xfade=transition=fade:duration=0.7:offset=7.8,format=yuv420p[v]" \
  -map "[v]" "${enc[@]}" -crf 27 "$VID/betonagem-loop.mp4"
ffmpeg -v error -y -i "$VID/betonagem-loop.mp4" -frames:v 1 -c:v libwebp -quality 82 "$VID/betonagem-loop.webp"

# Obras: trechos de cada vídeo, recorte 4:5
clip() { # clip <nome> <original> <início> <duração> <recorte do ffmpeg: largura:altura:x:y>
  ffmpeg -v error -y -ss "$3" -t "$4" -i "$ORIG/$2" -vf "crop=$5,fps=24,format=yuv420p" \
    "${enc[@]}" -crf 28 "$VID/$1.mp4"
  ffmpeg -v error -y -i "$VID/$1.mp4" -frames:v 1 -c:v libwebp -quality 80 "$VID/$1.webp"
}
clip betonagem-laje obra-1.mp4 0.5 9 576:720:0:150
# obra-2 tem a etiqueta "Barcelona" no alto e a legenda "projeto em andamento" embaixo: o recorte fica entre as duas
clip estrutura-barcelona obra-2.mp4 0 10 512:640:32:90
clip fundacoes-muros obra-3.mp4 9 10 576:720:0:200

ls -la "$IMG" "$VID"
