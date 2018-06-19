#!/bin/sh
# usage ./encoder.sh

encode () {
  mkdir -p /tmp/uploads/src/$1
  mkdir -p /tmp/uploads/dest/$1

  # encode mp3 file in aac wrapped in mp4 container
  # note: libfdk_aac is an alternative to aac
  # -vn disable video
  # -sn disable subtitle
  ffmpeg -i /tmp/uploads/$1.$3 -c:a aac -b:a 128000 -ar 48000 -ac 2 -vn -sn /tmp/uploads/src/$1/$1-128.mp4
  ffmpeg -i /tmp/uploads/$1.$3 -c:a aac -b:a 192000 -ar 48000 -ac 2 -vn -sn /tmp/uploads/src/$1/$1-192.mp4
  ffmpeg -i /tmp/uploads/$1.$3 -c:a aac -b:a 256000 -ar 48000 -ac 2 -vn -sn /tmp/uploads/src/$1/$1-256.mp4

  # prepare DASH + HLS manifest
  # --min_buffer_time second
  # --segment_duration duration of one segment in second
  /var/www/streamwave-library/lib/packager-linux \
    in=/tmp/uploads/src/$1/$1-128.mp4,stream=audio,output=/tmp/uploads/dest/$1/$1-128.mp4,playlist_name=$1-128.m3u8 \
    in=/tmp/uploads/src/$1/$1-192.mp4,stream=audio,output=/tmp/uploads/dest/$1/$1-192.mp4,playlist_name=$1-192.m3u8 \
    in=/tmp/uploads/src/$1/$1-256.mp4,stream=audio,output=/tmp/uploads/dest/$1/$1-256.mp4,playlist_name=$1-256.m3u8 \
  --min_buffer_time 3 \
  --segment_duration 3 \
  --hls_master_playlist_output /tmp/uploads/dest/$1/playlist-all.m3u8 \
  --mpd_output /tmp/uploads/dest/$1/manifest-full.mpd
}

# each file in tmp folder
for file in $1/*; do
  # keep only files
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    extension="${filename##*.}"
    filename="${filename%.*}"
    album=$2
    encode $filename $album $extension;
  fi
done
