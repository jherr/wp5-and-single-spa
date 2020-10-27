// This util convert data fetch function to observable which emits json

/*
  input(funtion which returns json)
*/

import {
  from,
  empty,
} from 'rxjs';

import LinkHeader from 'http-link-header';


const toAsync = (fn) => async (...args) => fn(...args);

export const toObservable = (fn) => {
  const asyncFn = toAsync(fn);
  return (...args) => from(asyncFn(...args));
};

// This section is used for uql dataSource
// TODO this is a mock
export const translateDataSourceDefinitionToFetch = (def) => def.query;


export const uqlPaginationStretagy = (getDataSource, res)=> {
  const linkHeader = res.headers.get('Link');
  const next = LinkHeader.parse(linkHeader).get('rel', 'next');
  if (next.length) {
    return getDataSource(next[0].uri);
  }
  return empty();
}
