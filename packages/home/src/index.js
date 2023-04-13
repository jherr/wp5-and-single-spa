import { registerApplication, start } from 'single-spa';

registerApplication(
  'product-image',
  () => import('productImage/ProductImage'),
  location => location.pathname.startsWith('/')
);

registerApplication(
  'header',
  () => import('nav/Header'),
  location => location.pathname.startsWith('/')
);

registerApplication(
  'footer',
  () => import('nav/Footer'),
  location => location.pathname.startsWith('/')
);

registerApplication(
  'buy-tools',
  () => import('buyTools/BuyTools'),
  location => location.pathname.startsWith('/')
);

registerApplication(
  'cart',
  () => import('cart/Cart'),
  location => location.pathname.startsWith('/')
);

start();
