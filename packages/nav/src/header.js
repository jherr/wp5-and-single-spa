import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import store from 'store/store';
import Cart from 'cart/Cart/Cart';

const Header = () => {
  const [count, setCount] = useState(store.count);

  console.log({ ReactDOM, ReactDOMClient });

  useEffect(() => {
    store.subscribe(() => {
      setCount(store.count);
    });
  }, []);
  return (
    <div className="mui-appbar mui--appbar-line-height">
      <table width="100%">
        <tbody>
          <tr style={{ verticalAlign: 'middle' }}>
            <td
              className="mui--appbar-height mui--text-display1"
              style={{ paddingLeft: '1em' }}
            >
              Header - React v{React.version}
            </td>
            <td
              className="mui--appbar-height mui--text-display1"
              align="right"
              style={{ paddingRight: '1em' }}
            >
                <small>Cart Count - {count}</small>
                <Cart />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const headerLifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Header
});

export const bootstrap = headerLifecycles.bootstrap;
export const mount = headerLifecycles.mount;
export const unmount = headerLifecycles.unmount;
