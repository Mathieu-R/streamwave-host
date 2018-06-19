[![dependencies Status](https://david-dm.org/Mathieu-R/streamwave-library/status.svg)](https://david-dm.org/Mathieu-R/streamwave-library)

# streamwave-library
library api for streamwave where user can grab the music library, playlists,... 

### Usage
```
npm install && NODE_ENV=production node server.js
```

> You need some stuff on your server
- MongoDB
- Redis

> You need to set some environment variables

`DBURL`: mongo db connection string (https://docs.mongodb.com/manual/reference/connection-string/)  

`JWT_SECRET`: strong secret for JSON WEB TOKEN.    
`REDIS_PASSWORD`: strong secret for Redis.    
