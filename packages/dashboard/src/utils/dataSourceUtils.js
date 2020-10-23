// This util convert data fetch function to observable which emits json

/*
  input(funtion which returns json)
*/

import {
  from,
} from 'rxjs';

const toAsync = (fn) => async (...args) => fn(...args);

export const toObservable = (fn) => {
  const asyncFn = toAsync(fn);
  return (...args) => from(asyncFn(...args));
};

// This section is used for uql dataSource
// TODO this is a mock
export const translateDataSourceDefinitionToFetch = (def) => def.query;
