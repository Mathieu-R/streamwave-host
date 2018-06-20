const http = require('http');
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const mime = require('mime');
const cors = require('cors');
const url = require('url');

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

router.get('/library', jwt, getLibrary);
router.get('/album/:id', jwt, getAlbum);
router.get('/playlists', jwt, getUserAllPlaylists);
router.get('/playlist/:id', jwt, getUserPlaylist);
router.delete('/playlist/:id', jwt, removeUserPlaylist);

router.get('/search/:term', jwt, search);
router.post('/playlist', jwt, addPlaylist);
router.post('/playlist/:playlistId', jwt, addTrackToPlaylist);
router.delete('/playlist/:playlistId/:trackId', jwt, removeTrackFromPlaylist);

router.post('/album/upload', jwt, upload.array('musics'), uploadMusic);

module.exports = app;
