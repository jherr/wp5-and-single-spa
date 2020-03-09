const createStore = () => {
  let count = 0;
  let image = 0;
  const subscribers = [];

  return {
    get count() {
      return count;
    },
    incrementCount() {
      count += 1;
      subscribers.forEach(fn => fn());
    },
    get image() {
      return image;
    },
    set image(img) {
      image = img;
      subscribers.forEach(fn => fn());
    },
    subscribe(fn) {
      subscribers.push(fn);
    }
  }
};

const store = createStore();

export default store;
