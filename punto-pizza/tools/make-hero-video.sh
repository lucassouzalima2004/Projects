#!/usr/bin/env bash
# Monta o vídeo do topo (assets/video/) com ffmpeg:
#   1. a margherita do Carlos (foto que ele pediu para o topo), com um zoom lento;
#   2. quatro clipes gratuitos do Mixkit: farinha caindo na massa, sovando, abrindo o disco, molho;
#   3. mais duas pizzas do app dele (Porchettina e Prosciutto e Funghi);
#   4. volta para a margherita, igual ao primeiro quadro: o loop não dá pulo.
# Tudo com a mesma cor (um pouco mais quente) e fusões de 0,6 s.
#
# Saída: hero-1080 e hero-720 (deitados), hero-tall (celular em pé), cada um em MP4 e WebM,
# e o primeiro quadro de cada formato em WebP (aparece enquanto o vídeo carrega).
#
# Uso:  bash tools/make-hero-video.sh     (dentro de punto-pizza/; os clipes são baixados em tools/clips/)
set -euo pipefail
cd "$(dirname "$0")/.."

CLIPS_DIR=tools/clips
SRC=tools/src
OUT=assets/video
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$CLIPS_DIR" "$OUT"

FPS=24
XF=0.6   # duração de cada fusão

# Segmentos em ordem. Clipe: "clip:<id Mixkit>:<início s>:<duração s>:<posição do recorte em pé, 0 a 1>"
#                     Foto:  "photo:<arquivo em tools/src>:<duração s>:<in|out>"   (in = aproxima, out = afasta)
SEGMENTS=(
  "photo:margherita-carlos.jpg:4.2:out"
  "clip:1669:1.0:3.6:0.5"
  "clip:42467:6.2:3.0:0.55"
  "clip:42469:3.0:3.2:0.6"
  "clip:42474:0.8:3.2:0.45"
  "photo:porchettina.jpg:2.9:in"
  "photo:prosciutto-e-funghi.jpg:2.9:out"
  "still:margherita-carlos.jpg:1.0"
)

# Mesma cor para tudo: um pouco mais de contraste e um tom mais quente
GRADE="eq=contrast=1.06:saturation=1.06:brightness=-0.015,colorbalance=rs=0.04:gs=0.01:bs=-0.05:rm=0.02:bm=-0.03"

for seg in "${SEGMENTS[@]}"; do
  IFS=: read -r kind a _ <<< "$seg"
  if [ "$kind" = clip ] && [ ! -s "$CLIPS_DIR/$a.mp4" ]; then
    echo "Baixando o clipe $a do Mixkit..."
    curl -fsSL -o "$CLIPS_DIR/$a.mp4" "https://assets.mixkit.co/videos/$a/$a-1080.mp4"
  fi
done

# Uma foto vira vídeo com zoom suave (a imagem é ampliada antes para o movimento não tremer)
photo_seg() { # arquivo duração in|out largura altura saída
  local file=$1 dur=$2 dir=$3 w=$4 h=$5 out=$6
  local n; n=$(python3 -c "print(round($dur*$FPS))")
  local z
  if [ "$dir" = in ]; then z="1+0.10*on/$n"; elif [ "$dir" = out ]; then z="1.10-0.10*on/$n"; else z="1"; fi
  ffmpeg -loglevel error -y -i "$SRC/$file" -frames:v "$n" -vf "\
crop='min(iw,ih*$w/$h)':'min(ih,iw*$h/$w)',scale=$((w * 4)):$((h * 4)):flags=lanczos,\
zoompan=z='$z':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$n:s=${w}x${h}:fps=$FPS,$GRADE,format=yuv420p" \
    -c:v libx264 -crf 12 -preset veryfast "$out"
}

clip_seg() { # id início duração posição largura altura saída
  local id=$1 ss=$2 dur=$3 pos=$4 w=$5 h=$6 out=$7 crop
  if [ "$w" -gt "$h" ]; then crop="scale=$w:$h:flags=lanczos"
  else crop="crop=ih*$w/$h:ih:(iw-ih*$w/$h)*$pos:0,scale=$w:$h:flags=lanczos"; fi
  ffmpeg -loglevel error -y -ss "$ss" -t "$dur" -i "$CLIPS_DIR/$id.mp4" -an \
    -vf "$crop,fps=$FPS,$GRADE,format=yuv420p" -c:v libx264 -crf 12 -preset veryfast "$out"
}

build() { # nome largura altura
  local name=$1 w=$2 h=$3 i=0 inputs=() durs=()
  for seg in "${SEGMENTS[@]}"; do
    IFS=: read -r kind a b c d <<< "$seg"
    local f="$TMP/$name-$i.mp4"
    case $kind in
      photo) photo_seg "$a" "$b" "$c" "$w" "$h" "$f"; durs+=("$b") ;;
      still) # o último trecho repete o primeiro quadro do vídeo, para o loop fechar sem pulo
             ffmpeg -loglevel error -y -i "$TMP/$name-0.mp4" -frames:v 1 "$TMP/$name-first.png"
             ffmpeg -loglevel error -y -loop 1 -framerate $FPS -t "$b" -i "$TMP/$name-first.png" -vf format=yuv420p \
               -c:v libx264 -crf 12 -preset veryfast "$f"
             durs+=("$b") ;;
      clip)  clip_seg "$a" "$b" "$c" "$d" "$w" "$h" "$f"; durs+=("$c") ;;
    esac
    inputs+=(-i "$f"); i=$((i + 1))
  done

  # Fusões em sequência
  local graph="" prev="[0:v]" t=0 k
  for ((k = 1; k < i; k++)); do
    t=$(python3 -c "print(round($t + ${durs[$((k - 1))]} - $XF, 3))")
    graph+="$prev[$k:v]xfade=transition=fade:duration=$XF:offset=$t[v$k];"
    prev="[v$k]"
  done
  graph=${graph%;}
  ffmpeg -loglevel error -y "${inputs[@]}" -filter_complex "$graph" -map "$prev" -c:v libx264 -crf 12 -preset veryfast "$TMP/$name-master.mp4"

  echo "Codificando $name..."
  # Um leve "denoise" tira o granulado da farinha: o arquivo fica bem menor sem perder a cara
  ffmpeg -loglevel error -y -i "$TMP/$name-master.mp4" -an -vf hqdn3d=2:1.5:6:4 -c:v libx264 -preset slow -crf 30 -profile:v high \
    -pix_fmt yuv420p -movflags +faststart "$OUT/$name.mp4"
  ffmpeg -loglevel error -y -i "$TMP/$name-master.mp4" -an -vf hqdn3d=2:1.5:6:4 -c:v libvpx-vp9 -crf 44 -b:v 0 -row-mt 1 \
    -deadline good -cpu-used 2 "$OUT/$name.webm"
}

build hero-1080 1920 1080
ffmpeg -loglevel error -y -i "$OUT/hero-1080.mp4" -frames:v 1 -c:v libwebp -quality 72 "$OUT/hero-poster.webp"
ffmpeg -loglevel error -y -i "$OUT/hero-1080.mp4" -an -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slow -crf 28 \
  -pix_fmt yuv420p -movflags +faststart "$OUT/hero-720.mp4"
ffmpeg -loglevel error -y -i "$OUT/hero-1080.webm" -an -vf scale=1280:720:flags=lanczos -c:v libvpx-vp9 -crf 42 -b:v 0 \
  -row-mt 1 -deadline good -cpu-used 2 "$OUT/hero-720.webm"
build hero-tall 720 1280
ffmpeg -loglevel error -y -i "$OUT/hero-tall.mp4" -frames:v 1 -c:v libwebp -quality 72 "$OUT/hero-poster-tall.webp"

ls -la "$OUT"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/hero-1080.mp4"
