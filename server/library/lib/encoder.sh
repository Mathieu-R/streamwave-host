#!/bin/zsh
# usage ./encoder.sh

encode () {
  mkdir -p ./src/$1
  mkdir -p ./dest/$1

  # encode mp3 file in aac wrapped in mp4 container
  # note: libfdk_aac is an alternative to aac
  # -vn disable video
  # -sn disable subtitle
  ffmpeg -i $1.mp3 -c:a aac -b:a 128000 -ar 48000 -ac 2 -vn -sn src/$1/$1-128.mp4
  ffmpeg -i $1.mp3 -c:a aac -b:a 192000 -ar 48000 -ac 2 -vn -sn src/$1/$1-192.mp4
  ffmpeg -i $1.mp3 -c:a aac -b:a 256000 -ar 48000 -ac 2 -vn -sn src/$1/$1-256.mp4

  # prepare DASH manifest
  ./packager \
    input=src/$1/$1-128.mp4,stream=audio,output=dest/$1/$1-128.mp4 playlist_name=$1-128.m3u8 \
    input=src/$1/$1-192.mp4,stream=audio,output=dest/$1/$1-192.mp4 playlist_name=$1-192.m3u8 \
    input=src/$1/$1-256.mp4,stream=audio,output=dest/$1/$1-256.mp4 playlist_name=$1-256.m3u8 \
  --min_buffer_time 3 \
  --segment_duration 3 \
  --hls_master_playlist_output dest/$1/playlist-all.m3u8
  --mpd_output dest/$1/manifest-full.mpd

  mkdir -p ./dest/$1/hls/128
  mkdir -p ./dest/$1/hls/192
  mkdir -p ./dest/$1/hls/256

  # # prepare m3u8 playlist for HLS
  # mediafilesegmenter -t 3 src/$1/$1-128.mp4 -f ./dest/$1/hls/128
  # mediafilesegmenter -t 3 src/$1/$1-192.mp4 -f ./dest/$1/hls/192
  # mediafilesegmenter -t 3 src/$1/$1-256.mp4 -f ./dest/$1/hls/256

  # mv ./dest/$1/hls/128/prog_index.m3u8 ./dest/$1/hls/128/$1-128.m3u8
  # mv ./dest/$1/hls/192/prog_index.m3u8 ./dest/$1/hls/192/$1-192.m3u8
  # mv ./dest/$1/hls/256/prog_index.m3u8 ./dest/$1/hls/256/$1-256.m3u8

  # variantplaylistcreator -o ./dest/$1/playlist-all.m3u8 \
  #   https://cdn.streamwave.be/$2/$1/hls/128/$1-128.m3u8 ./src/$1/$1-128.plist \
  #   https://cdn.streamwave.be/$2/$1/hls/192/$1-192.m3u8 ./src/$1/$1-192.plist \
  #   https://cdn.streamwave.be/$2/$1/hls/256/$1-256.m3u8 ./src/$1/$1-256.plist
}

# each mp3 file in folder
for file in ./*; do
  filename=$(basename "$file")
  extension="${filename##*.}"
  if [ $extension = mp3 ]; then
    filename="${filename%.*}"
    folder=$(basename `pwd`)
    encode $filename $folder
  fi
done
