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

const dataSource = (config) => () => {
  const { query: url } = config;
  const res$ = from(fetch(url)).pipe(
    expand((res) => {
      const linkHeader = res.headers.get('Link');
      const next = LinkHeader.parse(linkHeader).get('rel', 'next');
      if (next.length) {
        return from(fetch(next[0].uri));
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
