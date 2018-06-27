const http = require('http');
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const mime = require('mime');

const app = express();

const { UPLOAD_PATH } = require('./utils');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  // multer does not put extension in filename by default
  // could involve some problems
  // https://github.com/expressjs/multer/issues/170
  filename: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, buffer) => {
      if (err) return cb(err);
      cb(null, `${buffer.toString('hex')}.${mime.getExtension(file.mimetype)}`);
    });
  }
});
const upload = multer({storage});

const {
  getLibrary, getAlbum, uploadMusic
} = require('./controllers/library');

const {
  getUserAllPlaylists, getUserPlaylist,
  addPlaylist, addTrackToPlaylist,
  removeUserPlaylist, removeTrackFromPlaylist
} = require('./controllers/playlist');

const {
  search
} = require('./controllers/search');

app.get('/library', getLibrary);
app.get('/album/:id', getAlbum);
app.get('/playlists', getUserAllPlaylists);
app.get('/playlist/:id', getUserPlaylist);
app.delete('/playlist/:id', removeUserPlaylist);

app.get('/search/:term', search);
app.post('/playlist', addPlaylist);
app.post('/playlist/:playlistId', addTrackToPlaylist);
app.delete('/playlist/:playlistId/:trackId', removeTrackFromPlaylist);

app.post('/album/upload', upload.array('musics'), uploadMusic);

module.exports = app;
