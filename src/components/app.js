import { h, Component } from 'preact';
import { Route, Switch } from 'react-router-dom';
import Loadable from '@7rulnik/react-loadable';
import Loading from './loading';
import PrivateRoute from '../guard/private-route';

import Toast from './toast';
import Auth from '../routes/auth';

const Home = Loadable({
  loader: () => import('../routes/home' /* webpackPrefetch: true, webpackChunkName: "route-home" */),
  loading: Loading,
  timeout: 10000
});

const App = () => (
  <div class="app">
    <Switch>
      <Route path="/auth" component={Auth} />
      <PrivateRoute path="/" component={Home} />
    </Switch>
    <Toast />
  </div>
);

export default App;
