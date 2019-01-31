const express = require('express');
const { arrayMove } = require('react-sortable-hoc');
const QueueManager = require('./models/queueManager');
const QueueItem = require('./models/queueItem');
const dbHelper = require('./helpers/dbHelper');

const { Router } = express;

let users = [];

let globalSocket = null;

const queueManager = new QueueManager({
  beginTrack: (track, user) => {
    queueManager.updateRecentlyPlayed();
    queueManager.playingContext = new QueueItem({
      track,
      startTimestamp: Date.now(),
      user,
    });
    queueManager.serverSideTrackProgress = 0;
    queueManager.emitPlayingContextChanged();
  },
  playNext: () => {
    queueManager.updateMostPlayed();
    queueManager.serverSideTrackProgress = 0;
    queueManager.updateRecentlyPlayed();
    let nextItem = null;
    if (queueManager.playHistory.node.next) {
      nextItem = queueManager.playHistory.getNext().item;
      queueManager.beginTrack(nextItem.track, nextItem.user);
      queueManager.emitPlayHistoryChanged();
    } else if (queueManager.queue.length > 0) {
      nextItem = queueManager.getQueue().shift();
      queueManager.emitQueueChanged();
      queueManager.beginTrack(nextItem.track, nextItem.user);

      queueManager.playHistory.addNode({
        track: nextItem.track,
        user: nextItem.user,
      });
      queueManager.emitPlayHistoryChanged();
    } else {
      queueManager.playingContext = null;
      queueManager.emitPlayingContextChanged();
    }
  },
  playPrev: () => {
    if (queueManager.serverSideTrackProgress <= 5000 && queueManager.playHistory.node.prev) {
      const prevItem = queueManager.playHistory.getPrev().item;
      queueManager.beginTrack(prevItem.track, prevItem.user);
      queueManager.emitPlayHistoryChanged();
    } else {
      queueManager.updatePlayingContext('seek', null, null, 0);
    }
  },

  emitPlayingContextChanged: () => {
    globalSocket.emit('fetch playing context', queueManager.getPlayingContext());
    globalSocket.broadcast.emit('fetch playing context', queueManager.getPlayingContext());
  },
  emitRecentlyPlayedChanged: () => {
    globalSocket.emit('fetch recently played', queueManager.getRecentlyPlayed());
    globalSocket.broadcast.emit('fetch recently played', queueManager.getRecentlyPlayed());
  },
  emitPlayHistoryChanged: () => {
    globalSocket.emit('fetch play history', queueManager.getPlayHistory());
    globalSocket.broadcast.emit('fetch play history', queueManager.getPlayHistory());
  },
  emitMostPlayedChanged: () => {
    globalSocket.emit('fetch most played');
    globalSocket.broadcast.emit('fetch most played');
  },
  emitQueueChanged: () => {
    globalSocket.emit('fetch queue', queueManager.getQueue());
    globalSocket.broadcast.emit('fetch queue', queueManager.getQueue());
  },

  updatePlayingContext: (option, track, user, newTrackPosition) => {
    if (option === 'override') {
      queueManager.beginTrack(track, user);
      queueManager.playHistory.addNode({
        track,
        user,
      });
      queueManager.emitPlayHistoryChanged();
    } else if (option === 'pause' && queueManager.getPlayingContext()) {
      queueManager.modifyPlayingContext({
        currentlyPlaying: false,
        lastPausedAt: Date.now(),
      });
      queueManager.emitPlayingContextChanged();
    } else if (option === 'resume' && queueManager.getPlayingContext()) {
      queueManager.modifyPlayingContext({
        currentlyPlaying: true,
        totalTimePaused: queueManager.getPlayingContext().totalTimePaused + Date.now() - queueManager.getPlayingContext().lastPausedAt,
      });
      queueManager.emitPlayingContextChanged();
    } else if (option === 'seek' && queueManager.getPlayingContext()) {
      queueManager.modifyPlayingContext({
        currentlyPlaying: true,
        seekDistance: queueManager.getPlayingContext().seekDistance + (newTrackPosition - (Date.now() - queueManager.getPlayingContext().startTimestamp - queueManager.getPlayingContext().totalTimePaused + queueManager.getPlayingContext().seekDistance)),
      });
      queueManager.emitPlayingContextChanged();
    }
  },
  updateRecentlyPlayed: () => {
    if (!queueManager.getPlayingContext()) return;
    const { track } = queueManager.getPlayingContext();
    const index = queueManager.getRecentlyPlayed().findIndex(recentTrack => recentTrack.track.uri === track.uri);
    if (index !== -1) {
      queueManager.recentlyPlayed.splice(index, 1);
    }
    queueManager.recentlyPlayed.unshift(queueManager.getPlayingContext());
    queueManager.emitRecentlyPlayedChanged();
  },
  updateMostPlayed: () => {
    if (queueManager.getTotalPlayTime() > 30000) {
      dbHelper.update(queueManager.playingContext.track);
      queueManager.emitMostPlayedChanged();
    }
  },
  updateQueue: (oldIndex, newIndex) => {
    queueManager.queue = arrayMove(queueManager.queue, oldIndex, newIndex);
    queueManager.emitQueueChanged();
  },
});

// events that affect all connected clients
const userActions = (client) => {
  client.on('override playing context', (track, user) => {
    queueManager.updatePlayingContext('override', track, user);
  });
  client.on('pause playback', () => {
    queueManager.updatePlayingContext('pause');
  });
  client.on('resume playback', () => {
    queueManager.updatePlayingContext('resume');
  });
  client.on('seek track', (newTrackPosition) => {
    queueManager.updatePlayingContext('seek', null, null, newTrackPosition);
  });
  client.on('back track', () => {
    queueManager.playPrev();
  });
  client.on('skip track', () => {
    queueManager.playNext();
  });
  client.on('queue track', (track, user) => {
    queueManager.queueTrack(track, user);
  });
  client.on('remove track', (trackID) => {
    queueManager.removeFromQueue(trackID);
  });
  client.on('update queue', (oldIndex, newIndex) => {
    queueManager.updateQueue(oldIndex, newIndex);
  });
};

const socketApi = (io) => {
  const api = Router();
  api.get('/queue', (req, res) => {
    res.json(queueManager.getQueue());
  });
  api.get('/users', (req, res) => {
    res.json(users);
  });
  api.get('/playing-context', (req, res) => {
    res.json(queueManager.getPlayingContext());
  });
  api.get('/recently-played', (req, res) => {
    res.json(queueManager.getRecentlyPlayed());
  });
  api.get('/server-track-progress', (req, res) => {
    res.json(queueManager.getTrackProgress());
  });

  io.on('connection', (client) => {
    globalSocket = client;
    client.on('time', () => {
      client.emit('fetch server time', {
        time: Date.now(),
        trackProgress: queueManager.serverSideTrackProgress,
      });
    });
    
    client.on('add user', (data) => {
      if (!users.find(user => user.id === data.id)) {
        const newUser = data;
        newUser.socketID = client.id;
        newUser.banned = false;
        console.log(`${newUser.username} has connected!`);
        users.push(newUser);
      }
      client.emit('update users', users);
      client.broadcast.emit('update users', users);
    });

    client.on('disconnect', () => {
      users = users.filter(user => user.socketID !== client.id);
      if (!users.length) {
        queueManager.updatePlayingContext('pause');
      }
      client.emit('update users', users);
      client.broadcast.emit('update users', users);
    });

    userActions(client);
  });

  return api;
};

module.exports = socketApi;
