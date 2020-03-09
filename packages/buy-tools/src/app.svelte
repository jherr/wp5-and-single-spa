<script>
import fruit from 'home/fruit';
import store from 'store/store';

let image = store.image;
store.subscribe(() => {
  image = store.image;
});
const addToCart = () => {
  store.incrementCount();
};
</script>
<div class="mui-panel">
  <div style="text-align: center;">
    <img src={fruit[image].image} style="max-height: 200px;" />
  </div>
  <button
    on:click={addToCart}
    class="mui-btn mui-btn--primary"
    style="width: 100%;"
  >
    Add To Cart
  </button>
</div>