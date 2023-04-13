import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import Cart from './cart';

const cartLifecycles = singleSpaReact({
  React,
  ReactDOM,
  renderType: "render",
  rootComponent: Cart
});

export const bootstrap = cartLifecycles.bootstrap;
export const mount = cartLifecycles.mount;
export const unmount = cartLifecycles.unmount;
