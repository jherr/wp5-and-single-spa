import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';

const Cart = () => (
  <div className="mui-dropdown">
    <button className="mui-btn mui-btn--primary" data-mui-toggle="dropdown">
      Cart Items - React v{React.version}
      <span className="mui-caret"></span>
    </button>
    <ul className="mui-dropdown__menu">
      <li><a href="#">Option 1</a></li>
      <li><a href="#">Option 2</a></li>
      <li><a href="#">Option 3</a></li>
      <li><a href="#">Option 4</a></li>
    </ul>
  </div>
);

export default Cart;
