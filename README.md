[![Build Status](https://travis-ci.org/Mathieu-R/streamwave.svg?branch=master)](https://travis-ci.org/Mathieu-R/streamwave)
[![dependencies Status](https://david-dm.org/Mathieu-R/streamwave/status.svg)](https://david-dm.org/Mathieu-R/streamwave)

# streamwave
TFE bachelor degree (EPHEC). Music Streaming PWA with great user experience. Mobile first.

# Goals
- [X] Adaptive Streaming + Range Request  
- [X] DASH + HLS (Mobile Safari)   
- [X] Shaka player   
- [X] Preact    
- [X] NodeJS    
- [X] Basic auth + Google Oauth2     
- [X] Credential Management API    
- [X] Presentation API (Chromecast)    
    https://github.com/w3c/presentation-api/issues/448#issuecomment-387071162   
    https://github.com/w3c/remote-playback/issues/117    
    https://bugs.chromium.org/p/chromium/issues/detail?id=843965    
    https://github.com/w3c/presentation-api/issues/450#issuecomment-390948883    
- [X] Media Session API    
- [X] Service Worker    
- [X] Background Fetch    
    https://bugs.chromium.org/p/chromium/issues/detail?id=825878     
- [X] Background Sync     
- [X] Median Cut 
- [X] Track data volume    
    https://github.com/google/shaka-player/issues/1416    
    https://github.com/google/shaka-player/issues/1439    
    https://github.com/google/shaka-player/issues/1439     
- [X] Upload your own music

### Notes
Background Fetch : 
I noticed that Background Fetch works in chrome canary with `experimental web platform features` flag on `(chrome://flags)`.

### Usage

You need these 2 API to make the app work.
- https://github.com/Mathieu-R/streamwave-auth
- https://github.com/Mathieu-R/streamwave-library

In order to use the chromecast feature you need the receiver
- https://github.com/Mathieu-R/streamwave-presentation

> Developpment
```
npm install && npm run start
```

> Host on your own server
```
npm install && npm run build
```

Once it is done, you can serve the `dist` folder (ex: with nginx, apache,...).
