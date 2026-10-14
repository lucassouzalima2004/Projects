#!/usr/bin/env bash
# Transforma os vídeos da casa nas sequências de imagens que o scroll usa.
#
# Uso (de dentro da pasta nuvo-woodwork/):
#   tools/make-frames.sh                         converte tudo o que estiver em videos/
#   tools/make-frames.sh videos/02-kitchen.mp4   converte só um vídeo
#   tools/make-frames.sh --manifest              só reescreve assets/frames/manifest.js
#
# O nome do arquivo é o id da cena no content.js (pode ter número na frente):
#   videos/02-kitchen.mp4          versão 16:9 (a principal)
#   videos/02-kitchen-mobile.mp4   versão 9:16 para celular em pé (opcional)
# Sem a versão mobile, o script recorta o centro do vídeo 16:9 em 3:4 para o celular.
#
# Ajustes (variáveis de ambiente):
#   FPS=12        quadros por segundo de vídeo (mais = mais suave e mais pesado)
#   QUALITY=60    qualidade do WebP, de 0 a 100
#   WIDTH=1440    largura máxima dos quadros 16:9 (vídeo menor fica do tamanho dele)
#
# Precisa do ffmpeg (com libwebp). O manifest.js é refeito no fim, então dá para
# apagar uma pasta de assets/frames/ e rodar --manifest para tirar a cena do ar.
set -euo pipefail

cd "$(dirname "$0")/.."
FPS=${FPS:-12}
QUALITY=${QUALITY:-60}
WIDTH=${WIDTH:-1440}
OUT=assets/frames

command -v ffmpeg >/dev/null || { echo "Instale o ffmpeg primeiro (https://ffmpeg.org)." >&2; exit 1; }
ffmpeg -hide_banner -encoders 2>/dev/null | grep libwebp >/dev/null || { echo "Este ffmpeg não tem libwebp." >&2; exit 1; }

encode() { # entrada, filtro, pasta de saída
  rm -rf "$3"
  mkdir -p "$3"
  ffmpeg -loglevel error -y -i "$1" -an -vf "$2" -c:v libwebp -quality "$QUALITY" -compression_level 6 "$3/%04d.webp"
}

convert_video() {
  local src=$1 name id
  name=$(basename "${src%.*}")
  id=${name#[0-9][0-9]-}
  if [[ $id == *-mobile ]]; then
    id=${id%-mobile}
    encode "$src" "fps=$FPS,scale=-2:'min(1280,ih)':flags=lanczos" "$OUT/$id/mobile"
    echo "✓ $id (celular): $(ls "$OUT/$id/mobile" | wc -l | tr -d ' ') quadros"
    return
  fi
  encode "$src" "fps=$FPS,scale='min($WIDTH,iw)':-2:flags=lanczos" "$OUT/$id/lg" # sem ampliar vídeo menor
  echo "✓ $id: $(ls "$OUT/$id/lg" | wc -l | tr -d ' ') quadros"
  # Sem vídeo próprio para celular, recorta o centro em 3:4
  if ! compgen -G "videos/*$id-mobile.*" >/dev/null; then
    encode "$src" "fps=$FPS,crop='ih*3/4':ih,scale=-2:'min(960,ih)':flags=lanczos" "$OUT/$id/mobile"
    echo "  + versão para celular recortada do 16:9"
  fi
}

write_manifest() {
  local file=$OUT/manifest.js first dir id v n w h sep=""
  {
    echo "/* Gerado pelo tools/make-frames.sh: as cenas que já têm vídeo. Não edite à mão. */"
    printf 'window.NUVO_FRAMES = {'
    for dir in "$OUT"/*/; do
      [ -d "$dir" ] || continue
      id=$(basename "$dir")
      local parts=""
      for v in lg mobile; do
        [ -d "$dir$v" ] || continue
        n=$(find "$dir$v" -name '*.webp' | wc -l | tr -d ' ')
        [ "$n" -gt 0 ] || continue
        first=$(find "$dir$v" -name '*.webp' | sort | head -n 1)
        IFS=x read -r w h < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$first")
        parts+="${parts:+, }\"$v\": { \"n\": $n, \"w\": $w, \"h\": $h }"
      done
      [ -n "$parts" ] || continue
      printf '%s\n  "%s": { "ext": "webp", %s }' "$sep" "$id" "$parts"
      sep=","
    done
    [ -n "$sep" ] && echo
    echo "};"
  } > "$file"
  echo "→ $file"
}

mkdir -p "$OUT"
if [ "${1:-}" = "--manifest" ]; then
  write_manifest
  exit 0
fi

if [ $# -gt 0 ]; then
  for f in "$@"; do convert_video "$f"; done
else
  shopt -s nullglob
  videos=(videos/*.mp4 videos/*.mov videos/*.webm videos/*.MP4 videos/*.MOV)
  [ ${#videos[@]} -gt 0 ] || { echo "Nenhum vídeo em videos/. Veja o PROMPTS.md." >&2; write_manifest; exit 0; }
  for f in "${videos[@]}"; do convert_video "$f"; done
fi
write_manifest
du -sh "$OUT" | awk '{ print "Tamanho total dos quadros: " $1 }'
