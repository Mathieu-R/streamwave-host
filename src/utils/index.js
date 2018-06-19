export function formatDuration (duration) {
  const min = Math.floor(duration / 60);
  let sec = Math.floor(duration % 60);
  sec = sec < 10 ? "0" + sec : sec;
  return `${min}:${sec}`;
}

export function shuffle ([...array]) {
  let length = array.length;
  while (length) {
    const index = Math.floor(Math.random() * length--);
    [array[length], array[index]] = [array[index], array[length]];
  }
  return array;
}

export function cutList (tracks, currentTrack) {
  const index = tracks.findIndex(track => track.title === currentTrack.title) + 1;
  return index > tracks.length - 1 ? [] : [...tracks.slice(index)];
}

export function flatten(arr) {
  return Array.prototype.concat.apply([], arr);
}

export function getRGBCssFromObject ({r, g, b}) {
  return `rgb(${r}, ${g}, ${b})`;
}

export function pluralize (string, len) {
  return (len > 1 ? string + 's' : string);
}

// Copyright: https://github.com/web-push-libs/web-push
export function urlBase64ToUint8Array(base64String) {
  console.log(base64String);
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// user-agent sniffing, yeah, sure !
export function isMobile () {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function crossFade (context, fade = 6) {
  const audio = this.audio.base;

  // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
  context.resume().then(_ => {
    // gain node
    const gainNode = context.createGain();
    // current time
    const currentTime = audio.currentTime;
    // duration
    const duration = audio.duration;

    // fade in launched track
    gainNode.gain.linearRampToValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(1, currentTime + fade);

    // fade out
    gainNode.gain.linearRampToValueAtTime(1, duration - fade / 2);
    gainNode.gain.linearRampToValueAtTime(0, duration);

    // call this function when current music is finished playing (next is playing so ;))
    //setTimeout(this.crossFade(), (duration - FADE_TIME) * 1000);
  });
}
