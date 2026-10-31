#!/usr/bin/env bash
# Vídeos da visita por clique (?tour, tour.js), a partir dos vídeos do Flow:
#
#   tools/make-tour-videos.sh living-kitchen=~/Downloads/sala-cozinha.mp4 living-closet=~/Downloads/sala-closet.mp4
#
# Cada vídeo vira dois:
#   assets/video/<nome>.mp4       o caminho de ida (até 1920 px de largura, sem som)
#   assets/video/<nome>-rev.mp4   o mesmo de trás para frente: o "voltar" da visita faz o caminho voando
# Depois, em assets/js/content.js → visit.moves, o caminho usa o vídeo pelo nome, com reverse: true.
# Precisa do ffmpeg. CRF=18 deixa mais nítido (e mais pesado).
set -euo pipefail
cd "$(dirname "$0")/.."

CRF=${CRF:-20}
OUT=assets/video
mkdir -p "$OUT"

enc() { # origem filtros destino
  ffmpeg -v error -y -i "$1" -an -vf "$2scale='min(1920,iw)':-2:flags=lanczos,format=yuv420p" \
    -c:v libx264 -preset slow -crf "$CRF" -profile:v high -movflags +faststart "$3"
  echo "  $3 ($(du -k "$3" | cut -f1) KB)"
}

for arg in "$@"; do
  name=${arg%%=*}
  src=${arg#*=}
  [ -f "$src" ] || { echo "não achei $src" >&2; exit 1; }
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
  echo "$name: ${dur}s"
  enc "$src" "" "$OUT/$name.mp4"
  enc "$src" "reverse," "$OUT/$name-rev.mp4"
done
