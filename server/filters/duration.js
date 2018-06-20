const duration = dust => {
  dust.filters.duration = duration => {
    const min = Math.floor(duration / 60);
    let sec = Math.floor(duration % 60);
    sec = sec < 10 ? "0" + sec : sec;
    return `${min}:${sec}`;
  }
}

module.exports = duration;
