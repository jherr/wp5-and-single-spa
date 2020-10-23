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
import LinkHeader from 'http-link-header';
import deepmerge from 'deepmerge';
import { toObservable, translateDataSourceDefinitionToFetch } from './dataSourceUtils';

const dataSource = (config) => () => {
  const fetch$ = toObservable(fetch);
  const params = translateDataSourceDefinitionToFetch(config);
  const res$ = fetch$(params).pipe(
    expand((res) => {
      // this hanles multipage need change to actual implementation
      const linkHeader = res.headers.get('Link');
      const next = LinkHeader.parse(linkHeader).get('rel', 'next');
      if (next.length) {
        return fetch$(next[0].uri);
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
