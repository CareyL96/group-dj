import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import rootReducer from '../reducers/index';
import sessionMiddleware from '../middlewares/sessionMiddleware';
import socketMiddleware from '../middlewares/socketMiddleware';
import searchMiddleware from '../middlewares/searchMiddleware';
import playerMiddleware from '../middlewares/playerMiddleware';
import viewMiddleware from '../middlewares/viewMiddleware';
import devicesMiddleware from '../middlewares/devicesMiddleware';
import audioMiddleware from '../middlewares/audioMiddleware';

import loggingMiddleware from '../middlewares/loggingMiddleware';

const middleware = applyMiddleware(
  loggingMiddleware,
  sessionMiddleware,
  socketMiddleware,
  playerMiddleware,
  devicesMiddleware,
  audioMiddleware,
  searchMiddleware,
  viewMiddleware,
  thunk,
);

const store = createStore(
  rootReducer,
  composeWithDevTools(middleware),
);

export default store;
