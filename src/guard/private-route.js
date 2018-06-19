// https://tylermcginnis.com/react-router-protected-routes-authentication/
import { h, Component } from 'preact';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import authenticated from './authenticated';

import {
  storeUser
} from '../store/user';

const mapDispatchToProps = dispatch => ({
  storeUser: user => dispatch(storeUser(user))
});

// has the same api as <Route />
const Private = ({component: Component, storeUser, ...props}) => (
  // renders a route and pass all the props
  <Route {...props} render={props => (
    // check if the user is authenticated
    // then return the Component or perform a redirection
    authenticated(storeUser) ? <Component {...props} /> : <Redirect to="/auth" />
  )} />
);

export default connect(null, mapDispatchToProps)(Private);
