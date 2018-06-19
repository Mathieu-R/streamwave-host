import { h, render } from 'preact';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import installServiceWorker from './install-service-worker';
import store from './store';

import './style/index.scss';
import App from './components/app';

if (process.env.NODE_ENV === 'development') {
  // react devtools
  require('preact/debug');
}

installServiceWorker(store);

const Main = () => (
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);

let root = document.body.firstElementChild;
// render a root component in <body>
const rendering = Component => {
  root = render(<Component/>, document.body, root);
};

// preact hmr
if (module.hot) {
  module.hot.accept('./components/app', () => rendering(Main));
}

rendering(Main);
