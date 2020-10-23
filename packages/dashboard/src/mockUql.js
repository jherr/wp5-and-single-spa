const uql = ( ) => {
  let res = {};
  const get = () => res;
  const set = (inComming) => {
    res = {
      ...res,
      ...inComming,
    };
  };
  return async ({ query, a, b }) => {
    const restRes = await Promise.resolve({ query, a, b });
    set(restRes);
    return get();
  };
};

export default uql;
