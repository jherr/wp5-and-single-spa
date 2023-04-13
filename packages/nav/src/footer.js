import React from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';

const Footer = () => (
  <div className="mui-appbar mui--appbar-line-height">
    <table width="100%">
      <tbody>
        <tr style={{ verticalAlign: 'middle' }}>
          <td
            className="mui--appbar-height mui--text-display1"
            style={{ paddingLeft: '1em' }}
          >
            Footer
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);  

const footerLifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Footer
});

export const bootstrap = footerLifecycles.bootstrap;
export const mount = footerLifecycles.mount;
export const unmount = footerLifecycles.unmount;
