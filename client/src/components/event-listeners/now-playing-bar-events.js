import store from '../../../../store/store';
import { seekTrack } from '../../../../actions/playerActions';
import { adjustVolume } from '../../../../actions/audioActions';

function draggable(element, context) {
  const progressBar = element;
  const progressBarProgress = progressBar.children[0].children[0];
  const progressBarSlider = progressBar.children[0].children[1];

  let isMouseDown = false;
  let startingWidthPercentage;
  let mousePositionStart;
  let percentBuffered;

  function onMouseDown(e) {
    isMouseDown = true;
    const { length } = store.getState().playingContext;
    mousePositionStart = e.clientX;
    startingWidthPercentage = e.offsetX / progressBar.offsetWidth * 100;

    progressBarProgress.style.width = `${startingWidthPercentage}%`;
    progressBarSlider.style.left = `${startingWidthPercentage}%`;

    let newTrackPosition = Math.floor(length * startingWidthPercentage / 100);
    if (newTrackPosition < 0) newTrackPosition = 0;
    context.setState({
      trackProgress: newTrackPosition,
      mouseDown: true,
    });
  }

  function onMouseMove(e) {
    if (!isMouseDown) return;
    const { length } = store.getState().playingContext;
    const mousePositionCurrent = e.clientX;

    const deltaXPercentage = (mousePositionCurrent - mousePositionStart) / progressBar.offsetWidth * 100;
    percentBuffered = startingWidthPercentage + deltaXPercentage;
    if (percentBuffered < 0) percentBuffered = 0;
    if (percentBuffered > 100) percentBuffered = 100;

    let newTrackPosition = Math.floor(length * percentBuffered / 100);
    if (newTrackPosition < 0) newTrackPosition = 0;
    context.setState({ trackProgress: newTrackPosition });

    progressBarProgress.style.width = `${percentBuffered}%`;
    progressBarSlider.style.left = `${percentBuffered}%`;
  }

  function onMouseUp(e) {
    if (!isMouseDown) return;
    const { length } = store.getState().playingContext;
    const mousePositionCurrent = e.clientX;

    const deltaXPercentage = (mousePositionCurrent - mousePositionStart) / progressBar.offsetWidth * 100;
    percentBuffered = startingWidthPercentage + deltaXPercentage;
    if (percentBuffered < 0) percentBuffered = 0;
    if (percentBuffered > 100) percentBuffered = 100;

    let newTrackPosition = Math.floor(length * percentBuffered / 100);
    if (newTrackPosition < 0) newTrackPosition = 0;
    store.dispatch(seekTrack(newTrackPosition));
    context.setState({
      trackProgress: newTrackPosition,
      mouseDown: false,
    });
    isMouseDown = false;
  }

  element.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function draggableVolume(element, context) {
  const volumeBar = element;
  const volumeBarProgress = volumeBar.children[0].children[0];
  const volumeBarSlider = volumeBar.children[0].children[1];

  let isMouseDown = false;
  let startingWidthPercentage;
  let mousePositionStart;
  let volume;
  let interval;

  function onMouseDown(e) {
    isMouseDown = true;
    context.setState({ mouseDown: true });

    mousePositionStart = e.clientX;
    startingWidthPercentage = e.offsetX / volumeBar.offsetWidth * 100;
    context.setState({ volume: Math.ceil(startingWidthPercentage) });
    volumeBarProgress.style.width = `${startingWidthPercentage}%`;
    volumeBarSlider.style.left = `${startingWidthPercentage}%`;
  }

  function onMouseMove(e) {
    if (!isMouseDown) return;
    const mousePositionCurrent = e.clientX;

    const deltaXPercentage = (mousePositionCurrent - mousePositionStart) / volumeBar.offsetWidth * 100;
    volume = Math.ceil(startingWidthPercentage + deltaXPercentage);
    if (volume < 0) volume = 0;
    if (volume > 100) volume = 100;
    context.setState({ volume });

    const volumeDispatcher = () => {
      store.dispatch(adjustVolume(volume));
    };
    if (!interval) interval = setInterval(volumeDispatcher, 500);

    volumeBarProgress.style.width = `${volume}%`;
    volumeBarSlider.style.left = `${volume}%`;
  }

  function onMouseUp(e) {
    if (!isMouseDown) return;
    context.setState({ mouseDown: false });
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    const mousePositionCurrent = e.clientX;

    const deltaXPercentage = (mousePositionCurrent - mousePositionStart) / volumeBar.offsetWidth * 100;
    volume = Math.ceil(startingWidthPercentage + deltaXPercentage);
    if (volume < 0) volume = 0;
    if (volume > 100) volume = 100;
    store.dispatch(adjustVolume(volume));
    isMouseDown = false;
  }

  element.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}
function devicesMenuHandler() {
  const devicesMenu = document.querySelector('.devices-menu');
  document.addEventListener('click', (e) => {
    if (e.target !== document.querySelector('.btn-clear.refresh')) {
      if (e.target === document.querySelector('.btn-devices')) {
        if (devicesMenu.style.display === 'none') {
          devicesMenu.style.display = 'block';
        } else {
          devicesMenu.style.display = 'none';
        }
      } else {
        devicesMenu.style.display = 'none';
      }
    }
  });
}

export const addNowPlayingCenterEventListeners = (context) => {
  const progressBar = document.querySelector('.progress-bar-clickable');
  draggable(progressBar, context);
};

export const addNowPlayingRightEventListeners = (context) => {
  const volumeBar = document.querySelector('.volume-bar-clickable');
  draggableVolume(volumeBar, context);
  devicesMenuHandler();
};
