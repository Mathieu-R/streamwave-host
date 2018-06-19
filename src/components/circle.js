import { h, Component } from 'preact';
import { connect } from 'react-redux';
import { toasting } from '../store/toast';

const mapDispatchToProps = dispatch => ({
  toasting: (messages) => dispatch(toasting(messages))
});

class Circle extends Component {
  constructor() {
    super();
    this.container = null;
    this.canvas = null;
    this.width = 0;
    this.height = 0;
    // get initial volume on page load
    // then live update
    this.volume = 0;

    this.reset = this.reset.bind(this);
    this.draw = this.draw.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onVolumeDownloading = this.onVolumeDownloading.bind(this);
  }

  componentDidMount () {
    window.addEventListener('resize', this.onResize);
    document.addEventListener('data-volume', this.onVolumeDownloading);
    requestAnimationFrame(() => this.onResize());
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('data-volume', this.onVolumeDownloading);
  }

  componentDidUpdate () {
    this.volume = this.props.volume;
    requestAnimationFrame(() => this.draw());
  }

  reset () {
    this.props.resetDataVolume().then(() => {
      this.props.toasting(['Volume de données remis à zéro']);
    });
  }

  onVolumeDownloading (evt) {
    // volume in mo
    const volume = evt.detail.value / (1000 * 1024);
    this.volume += volume;
    requestAnimationFrame(() => this.draw());
  }

  onResize () {
    // remove the canvas to avoid screen flickering
    this.canvas.style.display = 'none';

    const DPR = window.devicePixelRatio || 1;
    const containerBCR = this.container.getBoundingClientRect();
    this.width = this.height = containerBCR.width;
    this.canvas.width = this.canvas.height = this.width * DPR;
    this.canvas.style.width = this.canvas.style.height = `${containerBCR.height}px`;

    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(DPR, DPR);

    this.canvas.style.display = 'block';

    this.draw();
  }

  draw () {
    const TAU = Math.PI * 2;
    const mid = this.width / 2;
    const lineWidth = 15;
    const radius = (this.width - lineWidth) / 2;
    const innerRadius = radius - lineWidth;
    const percentage = this.volume / this.props.dataMax;

    // remove old canvas
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // semi-transparent circle
    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.arc(mid, mid, radius, 0, TAU);
    this.ctx.lineWidth = lineWidth;
    this.ctx.closePath();
    this.ctx.fill();

    // move the origin at the center of the circle
    this.ctx.translate(mid, mid);
    // rotate (-90deg) around the center of the circle
    // that's why we translated before
    this.ctx.rotate(-Math.PI / 2);
    // move back the origin at 0,0 (top-left corner)
    this.ctx.translate(-mid, -mid);

    // filled circle
    this.ctx.beginPath();
    this.ctx.moveTo(mid, mid);
    this.ctx.arc(mid, mid, radius, 0, percentage * TAU);
    this.ctx.lineWidth = lineWidth;
    this.ctx.fillStyle = `rgb(${Math.round(percentage * 255)}, 255 , 128)`;
    this.ctx.closePath();
    this.ctx.fill();

    // inner to remove overlaping
    // keep the existing content where it does not overlap
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(mid, mid, innerRadius, 0, TAU);
    this.ctx.closePath();
    this.ctx.fill();

    // inner to allow to write text
    this.ctx.beginPath();
    this.ctx.moveTo(mid, mid);
    this.ctx.arc(mid, mid, innerRadius, 0, TAU);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();

    // text => downloaded - max data allowed
    const fontSize = (this.canvas.width / 2) < 200 ? '16px' : '18px';
    this.ctx.translate(mid, mid);
    this.ctx.rotate(Math.PI / 2);
    this.ctx.translate(-mid, -mid);
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = `${fontSize} Helvetica Neue`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'center';
    this.ctx.fillText(`${Math.round(this.volume)} mo / ${this.props.dataMax} mo`, mid, mid);
    this.ctx.restore();
  }

  render () {
    return (
      <div class="average-circle">
        <div className="average-circle__canvas-container" ref={container => this.container = container}>
          <canvas ref={canvas => this.canvas = canvas}></canvas>
        </div>
        <button class="average-circle__reset" onClick={this.reset}>Remettre à zéro</button>
      </div>
    );
  }
}

/**
 * Props
 * volume => 2 decimal float in Mo
 * dataMax => integer in Mo
 */
export default connect(null, mapDispatchToProps)(Circle);
