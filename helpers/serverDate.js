class ServerDate {
  constructor(socket) {
    this.socket = socket;
    this.timeDifference = 0;
    this.socket.on('fetch server time', (data) => {
      this.timeDifference = Date.now() > data.time ? Date.now() - data.time : data.time - Date.now();
      this.trackProgress = data.trackProgress;
    });
  }

  now() {
    return Date.now() + this.timeDifference;
  }

  getTrackProgress() {
    return this.trackProgress;
  }
}

export default ServerDate;
