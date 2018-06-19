import { h } from 'preact';

const Loading = ({error, pastDelay, timedOut}) => (
  <div class="loading-container">
    {
      // async loading failed
      error ? 'Error ! Please, try refreshing the page.'
      :
      // 200ms loading delay => show a loader
      pastDelay ? <div class="loader"/>
      :
      // connection too slow => timed out
      // need to pass a timeout properties to Loadable (e.g. {timeout: 10000})
      timedOut ? 'You connection seems too slow... Try again later.'
      :
      null
    }
  </div>
);

export default Loading;
