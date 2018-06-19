import { h, Component } from "preact";

class StorageQuota extends Component {
  constructor () {
    super();
    this.trackUsageBar = null;
    this.state = {};
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (nextState.quota !== this.state.quota) {
      return true;
    }

    if (nextState.usage !== this.state.usage) {
      return true;
    }

    return false;
  }

  componentDidMount () {
    navigator.storage.estimate().then(({quota, usage}) => {
      this.setState({
        quota: Math.round(quota / (1000 * 1024)),
        usage: Math.round(usage / (1000 * 1024))
      });

      this.trackUsageBar.style.transform = `scaleX(${usage / quota})`;
    }).catch(err => {
      console.warn('[STORAGE] cannot retrieve storage infos');
      console.error(err);
    });
  }

  render ({}, {quota, usage}) {
    return (
      <div class="storage">
        <div class="storage__title">Stockage disponible</div>
        <p class="storage__description">Le stockage disponible peut varier en fonction des implémentations</p>
        <section class="storage__container">
          <div class="storage__used" ref={track => this.trackUsageBar = track} />
        </section>
        <section class="storage__infos">
          <div class="storage__used-info">Utilisé • {usage}mb</div>
          <div class="storage__quota-info">Disponible • {quota >= 1000 ? `${quota / 1000}gb` : `${quota}mb`}</div>
        </section>
      </div>
    );
  }
}

export default StorageQuota;
