import { h, Component } from 'preact';
import { connect } from 'react-redux';

import {
  getDuration,
  getCurrentTime,
  setCurrentTime
} from '../store/player';

const mapStateToProps = state => ({
  duration: getDuration(state),
  currentTime: getCurrentTime(state)
});

const mapDispatchToProps = dispatch => ({
  setCurrentTime: time => dispatch(setCurrentTime(time))
});

class ProgressBar extends Component {
  constructor () {
    super();

    this.bcr = null;
    this.dragging = false;
    this.clampedPosition = null;

    this.onResize = this.onResize.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
    this.onSwipeStart = this.onSwipeStart.bind(this);
    this.onSwipeMove = this.onSwipeMove.bind(this);
    this.onSwipeEnd = this.onSwipeEnd.bind(this);
    this.seek = this.seek.bind(this);
  }

  componentDidMount () {
    document.addEventListener('touchmove', this.onSwipeMove, {passive: true});
    document.addEventListener('touchend', this.onSwipeEnd, {passive: true});
    document.addEventListener('mousemove', this.onSwipeMove, {passive: true});
    document.addEventListener('mouseup', this.onSwipeEnd, {passive: true});
    window.addEventListener('resize', this.onResize);
    this.onResize();
  }

  componentWillUnmount () {
    document.removeEventListener('touchmove', this.onSwipeMove, {passive: true});
    document.removeEventListener('touchend', this.onSwipeEnd, {passive: true});
    document.removeEventListener('mousemove', this.onSwipeMove, {passive: true});
    document.removeEventListener('mouseup', this.onSwipeEnd, {passive: true});
    window.removeEventListener('resize', this.onResize);
  }

  componentWillReceiveProps (nextProps) {
    if (!this.bcr) {
      this.onResize();
    }
  }

  componentDidUpdate () {
    if (this.dragging) {
      return;
    }

    const position = this.props.currentTime / this.props.duration;
    requestAnimationFrame(() => this.update(position));
  }

  onResize () {
    if (!this.container) return;
    const bcr = this.container.getBoundingClientRect();
    this.bcr = bcr;
  }

  findCandidate (evt) {
    if (evt.touches && evt.touches.length) {
      return evt.touches[0];
    }

    if (evt.changedTouches && evt.changedTouches.length) {
      return evt.changedTouches[0];
    }

    return evt;
  }

  updatePosition (evt) {
    const position = this.findCandidate(evt).pageX;
    const normalizedPosition = ((position - this.bcr.left) / this.bcr.width);
    const clampedPosition = Math.max(0, Math.min(normalizedPosition, 1));
    const currentTime = clampedPosition * this.props.duration;
    this.props.setCurrentTime(currentTime);
    requestAnimationFrame(() => this.update(clampedPosition));
    return currentTime;
  }

  seek (currentTime) {
    this.props.seek(currentTime);
  }

  update (position) {
    this.track.style.transform = `translate(-50%, -50%) scaleX(${position})`;
    this.round.style.transform = `translateX(${position * 100}%)`;
  }

  onSwipeStart (evt) {
    evt.stopPropagation();
    this.round.focus();
    this.dragging = true;
    this.innerRound.classList.add('highlight-round');
  }

  onSwipeMove (evt) {
    evt.stopPropagation();
    if (!this.dragging) {
      return;
    }

    this.updatePosition(evt);
  }

  onSwipeEnd (evt) {
    evt.stopPropagation();
    if (!this.dragging) {
      return;
    }

    this.dragging = false;
    this.innerRound.classList.remove('highlight-round');
    const currentTime = this.updatePosition(evt);
    this.seek(currentTime);
  }

  render ({duration, currentTime, borderRadius}) {
    // do not render component if not necessary
    if (!duration && !currentTime) return null;

    return (
      <div class={
        borderRadius ?
        'progress-bar progress-bar--radius' :
        'progress-bar'
      }
        ref={container => this.container = container}
        onTouchStart={this.onSwipeStart}
        onMouseDown={this.onSwipeStart}
      >
        <div class="progress-bar__track"></div>
        <div class={
          borderRadius ?
          'progress-bar__track-used progress-bar__track-used--radius' :
          'progress-bar__track-used'
        } ref={track => this.track = track}></div>
        <div class="progress-bar__round-container" ref={round => this.round = round}>
          <div class="progress-bar__round" ref={round => this.innerRound = round} />
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProgressBar);
