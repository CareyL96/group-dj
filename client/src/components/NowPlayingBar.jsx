import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addEventListeners } from './event-listeners/now-playing-bar-events';
import { updateProgressBar } from './event-listeners/now-playing-bar-events';

import {
  fetchTrackData,
  resumePlayback,
  pausePlayback,
  seekTrack,
  skipTrack,
} from '../../../actions/trackActions';

const parseMs = (ms) => {
  let result = '';
  let minutes = 0;
  let seconds = 0;

  minutes = Math.floor(ms / 1000 / 60);
  seconds = Math.floor((ms / 1000) % 60);

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  result += `${minutes}:${seconds}`;
  return result;
};

class NowPlayingBar extends Component {
  constructor() {
    super();
    this.state = {
      // currentlyPlaying: false,
      // startTimestamp: 0,
      // lastPausedAt: 0,
      // totalTimePaused: 0,
      trackProgress: 0,
      length: 0,
      mouseDown: false,
    };
    this.interval = null;
  }

  componentDidMount() {
    addEventListeners(this);
  }

  componentWillReceiveProps(newProps) {
    clearInterval(this.interval);
    const {
      // currentlyPlaying,
      // startTimestamp,
      // lastPausedAt,
      // totalTimePaused,
      // seekDistance,
      length,
    } = newProps;
    this.setState({
      // currentlyPlaying,
      // startTimestamp,
      // lastPausedAt,
      // totalTimePaused,
      // seekDistance,
      length,
    });

    if (newProps.currentlyPlaying) {
      this.interval = setInterval(() => updateProgressBar(this), 300);
    }
  }

  render() {
    return (
      <div className="now-playing-wrapper">
        <div className="now-playing-container">

          {/* NOW PLAYING BAR LEFT SIDE - ALBUM ART/TRACK INFO */}
          <div className="now-playing-left">
            <div className="album-art-container">
              <img id="album-art-thumbnail" src={this.props.albumArt} />
            </div>
            <div className="track-info">
              <div className="track-name"> {this.props.name} </div>
              <div className="track-artist"> {this.props.artists} </div>
            </div>
            <button className="control-button add-song">+</button>
          </div>

          {/* NOW PLAYING CENTER - PLAYER CONTROLS AND PROGRESS BAR */}
          <div className="now-playing-center">
            <div className="player-controls">
              <button className="control-button shuffle">shfl</button>
              <button className="control-button back">back</button>
              <button className="control-button play" onClick={this.props.currentlyPlaying ? this.props.pausePlayback : this.props.resumePlayback}>{this.props.currentlyPlaying ? 'pause' : 'play'}</button>
              <button className="control-button skip" onClick={this.props.skipTrack}>next</button>
              <button className="control-button resync" onClick={this.props.fetchTrackData}>resync</button>
            </div>
            <div className="progress-bar-container">
              <div className="progress-time">{parseMs(this.state.trackProgress)}</div>
              <div className="progress-bar-clickable" onClick={this.handleClick}>
                <div className="progress-bar">
                  <div className="progress-bar-progress" />
                  <div className="progress-bar-slider" />
                </div>
              </div>
              <div className="progress-time">{parseMs(this.state.length)}</div>
            </div>
          </div>

          <div className="now-playing-right">
            Right
            <div className="state-tracker">{`Track Length: ${this.state.length}`}</div>
            <div className="state-tracker">{`Track Progress: ${Math.floor(this.state.trackProgress)}`}</div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  currentlyPlaying: state.trackData.currentlyPlaying,
  name: state.trackData.name,
  artists: state.trackData.artists,
  length: state.trackData.length,
  startTimestamp: state.trackData.startTimestamp,
  seekDistance: state.trackData.seekDistance,
  lastPausedAt: state.trackData.lastPausedAt,
  totalTimePaused: state.trackData.totalTimePaused,
  albumArt: state.trackData.albumArt,
  popularity: state.trackData.popularity,
  userID: state.trackData.userID,
});
const mapDispatchToProps = dispatch => ({
  fetchTrackData: () => dispatch(fetchTrackData()),
  resumePlayback: () => dispatch(resumePlayback()),
  pausePlayback: () => dispatch(pausePlayback()),
  seekTrack: newTrackPosition => dispatch(seekTrack(newTrackPosition)),
  skipTrack: () => dispatch(skipTrack()),
  incrementTrackProgress: newTrackProgress => dispatch(incrementTrackProgress(newTrackProgress)),
});

export default connect(mapStateToProps, mapDispatchToProps)(NowPlayingBar);
