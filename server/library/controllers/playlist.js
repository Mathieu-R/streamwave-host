const Playlist = require('../models/Playlist');
const {Track} = require('../models/Track');
const ws = require('../websocket');

function getUserAllPlaylists (req, res) {
  Playlist.find({userId: req.user.id})
    .then(playlists => res.status(200).json(playlists))
    .catch(err => console.error(err));
}

function getUserPlaylist (req, res) {
  const {id} = req.params;

  if (!id) {
    res.status(422).send('playlist id is missing.');
    return;
  }

  Playlist.findById(id)
    .then(tracks => res.json(tracks))
    .catch(err => console.error(err));
}

function addPlaylist (req, res) {
  const {title} = req.body;

  if (!title) {
    res.status(422).send('playlist title is missing.');
    return;
  }

  const playlist = new Playlist({
    userId: req.user.id,
    title,
    tracks: []
  });

  playlist.save()
    .then(playlist => res.status(200).send(playlist))
    .catch(err => console.error(err));
}

function removeUserPlaylist (req, res) {
  const {id} = req.params;

  if (!id) {
    res.status(422).send('playlist id is missing.');
    return;
  }

  Playlist.findById(id).then(playlist => {
    if (!playlist) {
      res.status(204);
      return;
    }

    if (playlist.userId !== req.user.id) {
      res.status(401).send('Unauthorized to remove that playlist.');
    }

    return Playlist.remove({_id: id}).then(_ => {
      res.status(200).send('playlist removed.');
    })
  }).catch(err => {
    console.error(err);
    res.status(500).send('unknown error...');
  });
}

function addTrackToPlaylist (req, res) {
  const {playlistId} = req.params;
  const trackId = req.body._id;

  if (!playlistId) {
    res.status(422).send('playlist id is missing');
    return;
  }

  if (!trackId) {
    res.status(422).send('track id is missing');
    return;
  }

  Playlist.findById(playlistId)
  .then(playlist => {
      // could lead to a lot of embedded documents #bigdata
      // another way is to use references in album and playlist
      // but less efficient in NoSql and particularly mongodb
      playlist.tracks.push(req.body);
      return playlist;
    })
    .then(playlist => playlist.save())
    .then(() => res.status(200).json({done: true}))
    .catch(err => console.error(err));
}

function removeTrackFromPlaylist (req, res) {
  const {playlistId, trackId} = req.params;

  if (!playlistId) {
    res.status(422).send('playlist id is missing');
    return;
  }

  if (!trackId) {
    res.status(422).send('track id is missing');
    return;
  }

  Playlist.findById(playlistId).then(playlist => {
    if (playlist.userId !== req.user.id) {
      res.status(401).send('Unauthorized to remove track from that playlist.');
      return;
    }

    return Playlist.update({userId: req.user.id, _id: playlistId}, {$pull: {tracks: {'_id': trackId}}}).then(_ => {
      res.status(200).send('track removed from playlist.');
    });
  }).catch(err => console.error(err));
}

module.exports = {
  getUserAllPlaylists,
  getUserPlaylist,
  addPlaylist,
  addTrackToPlaylist,
  removeUserPlaylist,
  removeTrackFromPlaylist
}
