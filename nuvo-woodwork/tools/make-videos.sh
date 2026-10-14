#!/usr/bin/env bash
# Prepara os vídeos da casa para o scroll: o site anda o vídeo conforme a rolagem.
#
# Uso (de dentro da pasta nuvo-woodwork/):
#   tools/make-videos.sh                         converte tudo o que estiver em videos/
#   tools/make-videos.sh videos/02-kitchen.mp4   converte só um vídeo
#   tools/make-videos.sh --manifest              só refaz assets/video/manifest.js
#
# O nome do arquivo é o id do trecho no content.js (pode ter número na frente):
#   videos/02-kitchen.mp4         →  assets/video/kitchen.mp4       (telas largas)
#                                    assets/video/kitchen.tall.mp4  (celular em pé: o centro, em 3:4)
#   videos/02-kitchen-mobile.mp4  →  versão própria para celular em pé (opcional, no lugar do recorte)
#
# Para o vídeo andar liso com o scroll, ele sai com um quadro-chave a cada 2 quadros e sem
# B-frames: o navegador mostra qualquer ponto do vídeo na hora. Sai sem áudio, a 24 quadros/s.
# O manifest.js guarda também quanto a imagem muda de um quadro para o outro: o site usa isso
# para dar mais scroll às partes com movimento e passar depressa pelas partes paradas.
#
# Ajustes (variáveis de ambiente):
#   CRF=25      qualidade (menor = mais nítido e mais pesado; 23 a 28 é o normal)
#   WIDTH=1920  largura máxima (vídeo menor fica do tamanho dele)
#
# Precisa do ffmpeg (com libx264). O manifest.js é refeito no fim, então dá para apagar
# os arquivos de um trecho em assets/video/ e rodar --manifest para tirar o vídeo do ar.
set -euo pipefail

cd "$(dirname "$0")/.."
CRF=${CRF:-25}
WIDTH=${WIDTH:-1920}
FPS=24
OUT=assets/video

command -v ffmpeg >/dev/null || { echo "Instale o ffmpeg primeiro (https://ffmpeg.org)." >&2; exit 1; }
ffmpeg -hide_banner -encoders 2>/dev/null | grep libx264 >/dev/null || { echo "Este ffmpeg não tem libx264." >&2; exit 1; }

encode() { # entrada, filtro, saída
  ffmpeg -loglevel error -y -i "$1" -an -vf "$2,fps=$FPS" \
    -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -crf "$CRF" \
    -g 2 -keyint_min 2 -sc_threshold 0 -bf 0 -movflags +faststart "$3"
  echo "✓ $3: $(du -h "$3" | cut -f1)"
}

convert_video() {
  local src=$1 name id
  name=$(basename "${src%.*}")
  id=${name#[0-9][0-9]-}
  if [[ $id == *-mobile ]]; then
    encode "$src" "scale=-2:'min(960,ih)':flags=lanczos" "$OUT/${id%-mobile}.tall.mp4"
    return
  fi
  encode "$src" "scale='min($WIDTH,iw)':-2:flags=lanczos" "$OUT/$id.mp4" # sem ampliar vídeo menor
  # Sem vídeo próprio para celular, recorta o centro em 3:4
  if ! compgen -G "videos/*$id-mobile.*" >/dev/null; then
    encode "$src" "crop='ih*3/4':ih,scale=-2:'min(960,ih)':flags=lanczos" "$OUT/$id.tall.mp4"
  fi
}

size() { # largura x altura do vídeo
  ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$1"
}

# Quanto cada quadro muda em relação ao anterior (média da diferença, de 0 a 255, numa cópia pequena)
motion() {
  local tmp
  tmp=$(mktemp)
  ffmpeg -loglevel error -y -i "$1" \
    -vf "scale=192:108,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=$tmp" \
    -f null -
  awk -F= 'BEGIN { printf "0" } /YAVG/ { printf ",%.1f", $2 }' "$tmp"
  rm -f "$tmp"
}

write_manifest() {
  local file=$OUT/manifest.js f id n wide tall tallsize sep=""
  {
    echo "/* Gerado pelo tools/make-videos.sh: os trechos que já têm vídeo. Não edite à mão. */"
    printf 'window.NUVO_VIDEOS = {'
    for f in "$OUT"/*.mp4; do
      [[ -f $f && $f != *.tall.mp4 ]] || continue
      id=$(basename "${f%.mp4}")
      n=$(ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "$f")
      wide=$(size "$f")
      tall=""
      if [ -f "$OUT/$id.tall.mp4" ]; then
        tallsize=$(size "$OUT/$id.tall.mp4")
        tall=", \"tall\": \"$OUT/$id.tall.mp4\", \"tallSize\": [${tallsize/x/, }]"
      fi
      printf '%s\n  "%s": {\n    "src": "%s", "size": [%s]%s, "fps": %s, "frames": %s,\n    "motion": [%s]\n  }' \
        "$sep" "$id" "$f" "${wide/x/, }" "$tall" "$FPS" "$n" "$(motion "$f")"
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
du -sh "$OUT" | awk '{ print "Tamanho total dos vídeos: " $1 }'
