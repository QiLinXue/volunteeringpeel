/* tslint:disable:no-console no-var-requires */
import * as Promise from 'bluebird';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';

import api from './api/api';
import sessionManagement from './sessionManagement';

import 'babel-polyfill';

// Setup Express
const app = express();

// If dev do webpack things
if (process.env.NODE_ENV !== 'production' && !process.env.NO_REACT) {
  // Use require so that it doesn't get imported unless necessary
  const webpack = require('webpack');
  const webpackHot = require('webpack-hot-middleware');
  const webpackDev = require('webpack-dev-middleware');
  const dashboardPlugin = require('webpack-dashboard/plugin');
  const webpackConfig = require('../webpack.dev.js');
  const compiler = webpack(webpackConfig);

  compiler.apply(new dashboardPlugin());

  app.use(webpackHot(compiler, { publicPath: webpackConfig.output.publicPath }));
  app.use(
    webpackDev(compiler, {
      publicPath: webpackConfig.output.publicPath,
      stats: {
        colors: true,
      },
    }),
  );
}

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// Parse application/json
app.use(bodyParser.json());
// Sessions
sessionManagement(app);

// Use random number for port if in dev environment
const port = process.env.PORT || 19847;

// Find working directory
const appDir =
  process.env.NODE_ENV === 'production'
    ? path.resolve(__dirname, 'app')
    : path.resolve(__dirname, '../dist', 'app');

// Static assets
app.use(express.static(path.resolve(appDir)));

// API
app.use('/api', api);

// React
app.get('*', (req, res) => {
  res.sendFile(path.resolve(appDir, 'index.html'));
});

// Listen
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
