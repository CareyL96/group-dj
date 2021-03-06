import { combineReducers } from 'redux';
import sessionReducer from './sessionReducer';
import playerReducer from './playerReducer';
import usersReducer from './usersReducer';
import searchReducer from './searchReducer';
import viewReducer from './viewReducer';
import devicesReducer from './devicesReducer';
import audioReducer from './audioReducer';

const rootReducer = combineReducers({
  session: sessionReducer,
  playingContext: playerReducer,
  users: usersReducer,
  search: searchReducer,
  view: viewReducer,
  devices: devicesReducer,
  audio: audioReducer,
});

export default rootReducer;
