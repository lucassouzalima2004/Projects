#!/usr/bin/env bash
# Fotos das cenas do topo (chapters.js), a partir das imagens grandes (PNG ou JPG):
#
#   tools/make-scenes.sh kitchen=~/Downloads/cozinha.png living=~/Downloads/sala.png
#
# Foto deitada (16:9) vira duas:
#   assets/img/scenes/<nome>.webp       2752 px de largura (telas grandes e de alta densidade)
#   assets/img/scenes/<nome>-1376.webp  1376 px (telas pequenas)
# Foto em pé (9:16, a versão do celular) vira uma só, com 1440 px de largura:
#   assets/img/scenes/<nome>.webp       (em content.js ela entra como tall: 'scenes/<nome>.webp')
#
# A imagem deve ter pelo menos esse tamanho; menor que isso, o script avisa (ela fica
# esticada e perde nitidez: vale aumentar antes com um upscaler). Q=90 muda a qualidade.
set -euo pipefail
cd "$(dirname "$0")/.."

Q=${Q:-84}
OUT=assets/img/scenes
mkdir -p "$OUT"

webp() { # origem largura destino
  ffmpeg -v error -y -i "$1" -vf "scale=$2:-2:flags=lanczos" -c:v libwebp -quality "$Q" -compression_level 6 "$3"
  echo "  $3 ($(du -k "$3" | cut -f1) KB)"
}

for arg in "$@"; do
  name=${arg%%=*}
  src=${arg#*=}
  [ -f "$src" ] || { echo "não achei $src" >&2; exit 1; }
  IFS=, read -r w h < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$src")
  echo "$name: ${w}x${h}"
  if [ "$h" -gt "$w" ]; then
    [ "$w" -ge 1440 ] || echo "  atenção: tem só ${w} px de largura (o ideal é 1440 ou mais)"
    webp "$src" 1440 "$OUT/$name.webp"
  else
    [ "$w" -ge 2752 ] || echo "  atenção: tem só ${w} px de largura (o ideal é 2752 ou mais)"
    webp "$src" 2752 "$OUT/$name.webp"
    webp "$src" 1376 "$OUT/$name-1376.webp"
  fi
done
