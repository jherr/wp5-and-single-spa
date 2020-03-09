import fruit from 'home/fruit';
import singleSpaHtml from 'single-spa-html';
import store from 'store/store';

const template = `
<div
  class="product-images"
  style="display: grid; grid-template-columns: repeat(5, 20%);"
>
</div>
`;

const jsComponent = singleSpaHtml({
  template,
});

jsComponent.originalMount = jsComponent.mount;
jsComponent.mount = function(opts, props) {
  return jsComponent.originalMount(opts, props)
    .then(() => {
      const el = document.querySelector('.product-images');
      const html = 
        fruit
          .map(({image}, index) => `
<img src="${image}" style="max-width: 100%" data-index="${index}" />
          `)
          .join('');
      el.innerHTML = html;
      document
        .querySelectorAll('.product-images img')
        .forEach(el => el.addEventListener('click', (evt) => {
          store.image = parseInt(
            evt.target.getAttribute('data-index')
          );
        }))
    });
};

export const bootstrap = jsComponent.bootstrap;
export const mount = jsComponent.mount;
export const unmount = jsComponent.unmount;
