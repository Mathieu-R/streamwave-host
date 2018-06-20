[![Build Status](https://travis-ci.org/Mathieu-R/streamwave-host.svg?branch=master)](https://travis-ci.org/Mathieu-R/streamwave-host)
[![dependencies Status](https://david-dm.org/Mathieu-R/streamwave-host/status.svg)](https://david-dm.org/Mathieu-R/streamwave-host)

## streamwave-host
Improvement of streamwave (https://github.com/Mathieu-R/streamwave).     
A project realised in context of TFE.    
It was basically an Adaptive Music Streaming PWA.    
This improvement allows you to easily host that product on your own server at your home.    
You can upload your own music and make it available on all your devices.    

### Features
- [X] Adaptive Streaming + Range Request  
- [X] DASH + HLS (Mobile Safari)   
- [X] Shaka player   
- [X] NodeJS    
- [X] Basic auth + Google Oauth2     
- [X] Credential Management API    
- [X] Chromecast   
- [X] Media Session API    
- [X] Service Worker    
- [X] Background Fetch    
- [X] Background Sync     
- [X] Median Cut    
- [X] Track data volume    
- [X] Upload your own music   

### Notes
Background Fetch : 
I noticed that Background Fetch works in chrome canary with `experimental web platform features` flag on `(chrome://flags)`.

### Usage

In order to use the chromecast feature you need the receiver
- https://github.com/Mathieu-R/streamwave-presentation

> Developpment
```
npm install && npm run start
```

> Host on your own server
```
npm install && npm run build && npm run serve
```

> You need some stuff on your server
- MongoDB
- Redis

> You need to set some environment variables

`DBURL`: mongo db connection string (https://docs.mongodb.com/manual/reference/connection-string/)

Some credentials for Google Oauth2 : https://console.cloud.google.com/apis/credentials => Create credentials => `id client oauth` + autorize your app domain and your callback url.    

`GOOGLEID`: google oauth2 client id.   
`GOOGLESECRET`: google oauth2 secret.    
`GOOGLECALLBACKPROD`: google oauth2 callback.    

`REDIS_PASSWORD`: strong secret for Redis.    
`MAIL_HOST_PROD`: host url for mail (ex: smtp.example.com).    
`MAIL_PORT_PROD`: smtp port for mail.    
`MAIL_USER_PROD` and `MAIL_PASSWORD_PROD`: credentials of the email that will send the emails (account verification, password forgotten,...). 

`CDN_URL`: url of your own cdn (where all your music will be stored).

### Caveats
> In developpement
- You need `maildev` to catch mails.

`MAIL_HOST_DEV`: host url for mail (ex: localhost).    
`MAIL_PORT_DEV`: smtp port for mail (ex: 1025 for maildev).    

> You can use `docker` if you don't want to install all the tools on your developpement machine.
```
docker-compose up -d
```


