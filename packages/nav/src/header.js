import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import store from 'store/store';

const Header = () => {
  const [count, setCount] = useState(store.count);
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
              Header
            </td>
            <td
              className="mui--appbar-height mui--text-display1"
              align="right"
              style={{ paddingRight: '1em' }}
            >
                Cart Count - {count}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const headerLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Header
});

export const bootstrap = headerLifecycles.bootstrap;
export const mount = headerLifecycles.mount;
export const unmount = headerLifecycles.unmount;
