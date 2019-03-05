import React, { Component } from 'react';
import {
  BrowserRouter as Router, history, Route, Switch,
} from 'react-router-dom';
import App from '../App';
import IndexPage from './routes/IndexPage';

const Routes = () => (
  <Router history={history}>
    <App>
      <Switch>
        <Route exact path="/" component={IndexPage} />
      </Switch>
    </App>
  </Router>
);
export default Routes;
