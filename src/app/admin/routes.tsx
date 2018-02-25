// Library Imports
import * as React from 'react';
import * as reactLoadable from 'react-loadable';
import { RouteConfig } from 'react-router-config';
import { Redirect } from 'react-router-dom';

// App Imports
import Loading from '@app/common/components/Loading';

interface Route extends RouteConfig {
  title: string;
  display?: string;
}

const routes: Route[] = [
  {
    path: '/admin',
    exact: true,
    component: reactLoadable({
      loading: Loading,
      loader: () => import('@app/admin/components/pages/Home' /* webpackChunkName: "admin-home" */),
    }),
    title: 'Dashboard',
  },
];

export default routes;