import singleSpaSvelte from 'single-spa-svelte';
import myRootSvelteComponent from './app.svelte';

const svelteLifecycles = singleSpaSvelte({
  component: myRootSvelteComponent
});

export const bootstrap = svelteLifecycles.bootstrap;
export const mount = svelteLifecycles.mount;
export const unmount = svelteLifecycles.unmount;
