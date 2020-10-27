import {
  from,
  empty,
} from 'rxjs';
import {
  takeWhile,
  expand,
  concatMap,
  scan,
} from 'rxjs/operators';
import deepmerge from 'deepmerge';
import { toObservable, translateDataSourceDefinitionToFetch, uqlPaginationStretagy } from './dataSourceUtils';

const dataSource = (config) => () => {
  const { type } = config;
  let dataSourcefn =  fetch;
  if(type === "data"){
    dataSourcefn = async () => {
      const myBlob = new Blob([JSON.stringify(config.data)], {type : 'application/json'});
      const init = { "status" : 200 };
      return new Response(myBlob,init);
    };
  }
  const getDataSource = toObservable(dataSourcefn);
  const params = translateDataSourceDefinitionToFetch(config);
  const res$ = getDataSource(params).pipe(
    expand((res) => {
      // this hanles multipage need change to actual implementation
      if(type==="uql"){
        return uqlPaginationStretagy(getDataSource, res);
      }
      return empty();
    }),
    takeWhile((v) => v),
    concatMap((response) => from(response.json())),
    scan((acc, value) => deepmerge(acc, value), {}),
  );
  return res$;
};

export default dataSource;
