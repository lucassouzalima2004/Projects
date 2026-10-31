#!/usr/bin/env bash
# Vídeos da visita (?tour, tour.js): os mini vídeos de um cômodo para o outro.
#
#   tools/make-tour-videos.sh living-kitchen=~/Downloads/sala-cozinha.mp4 living-kitchen=~/Downloads/sala-cozinha-916.mp4
#
# Cada vídeo vira dois: o caminho de ida e o mesmo de trás para frente (o "voltar" faz o caminho voando).
# Vídeo deitado (computador):   assets/video/<nome>.mp4       e <nome>-rev.mp4       (até 1920 px de largura)
# Vídeo em pé, 9:16 (celular):  assets/video/<nome>-tall.mp4  e <nome>-tall-rev.mp4  (até 1080 px de largura)
# Sem som. Depois, em assets/js/content.js → visit.moves, o caminho usa o vídeo pelo nome.
#
# Ajustes (variáveis antes do comando):
#   SPEED=3      toca 3 vezes mais rápido (para um vídeo de 8 s virar um mini vídeo de uns 2,5 s)
#   END=7.5      corta o vídeo nesse segundo (o fim parado)
#   CROP_TALL=1  de um vídeo deitado, faz também a versão do celular recortando o meio em 9:16
#                (provisório: o certo é gerar o vídeo em pé)
#   CRF=18       mais nítido (e mais pesado); o padrão é 20
# Precisa do ffmpeg.
set -euo pipefail
cd "$(dirname "$0")/.."

CRF=${CRF:-20}
SPEED=${SPEED:-1}
OUT=assets/video
mkdir -p "$OUT"

enc() { # origem filtros largura-máxima destino
  local pre=""
  [ -n "${END:-}" ] && pre="trim=end=$END,"
  ffmpeg -v error -y -i "$1" -an \
    -vf "${pre}setpts=(PTS-STARTPTS)/$SPEED,fps=30,$2scale='min($3,iw)':-2:flags=lanczos,format=yuv420p" \
    -c:v libx264 -preset slow -crf "$CRF" -profile:v high -g 15 -movflags +faststart "$4"
  echo "  $4 ($(du -k "$4" | cut -f1) KB, $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$4" | cut -c1-4) s)"
}

for arg in "$@"; do
  name=${arg%%=*}
  src=${arg#*=}
  [ -f "$src" ] || { echo "não achei $src" >&2; exit 1; }
  IFS=, read -r w h < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$src")
  echo "$name: ${w}x${h}"
  if [ "$h" -gt "$w" ]; then
    enc "$src" "" 1080 "$OUT/$name-tall.mp4"
    enc "$src" "reverse," 1080 "$OUT/$name-tall-rev.mp4"
  else
    enc "$src" "" 1920 "$OUT/$name.mp4"
    enc "$src" "reverse," 1920 "$OUT/$name-rev.mp4"
    if [ "${CROP_TALL:-}" = 1 ]; then
      enc "$src" "crop=ih*9/16:ih," 1080 "$OUT/$name-tall.mp4"
      enc "$src" "reverse,crop=ih*9/16:ih," 1080 "$OUT/$name-tall-rev.mp4"
    fi
  fi
done
