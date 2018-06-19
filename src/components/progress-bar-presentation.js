import { h, Component } from 'preact';

class ProgressBar extends Component {
  constructor () {
    super();

    this.bcr = null;
    this.track = null;
    this.round = null;
  }

  componentDidMount () {
    window.addEventListener('resize', this.onResize);
    this.onResize();
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize);
  }

  shouldComponentUpdate (nextProps) {
    if (this.props.duration === null && nextProps.duration !== null) {
      return true;
    }

    if (this.props.currentTime === null && nextProps.currentTime !== null) {
      return true;
    }

    return false;
  }

  componentWillReceiveProps (props) {
    if (!this.bcr) {
      this.onResize();
    }

    // sometimes this method fires
    // even when not needed (e.g. in search page)
    // should investigate why
    if (props.currentTime === null || props.duration === null) {
      return;
    }

    const clampedPosition = props.currentTime / props.duration;
    requestAnimationFrame(() => this.update(clampedPosition));
  }

  onResize () {
    if (!this.container) return;
    const bcr = this.container.getBoundingClientRect();
    this.bcr = bcr;
  }

  update (position) {
    this.track.style.transform = `translate(0, -50%) scaleX(${position})`;
    this.round.style.transform = `translateX(${position * 100}%)`;
  }

  render ({duration, currentTime}) {
    // do not render component if not necessary
    if (!duration && !currentTime) return null;

    return (
      <div class="progress-bar-presentation"
        ref={container => this.container = container}
      >
        <div class="progress-bar-presentation__track" ref={track => this.track = track}></div>
        <div class="progress-bar-presentation__round-container" ref={container => this.round = container}>
          <div class="progress-bar-presentation__round" />
        </div>
      </div>
    );
  }
}

export default ProgressBar;
