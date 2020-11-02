import {
  map,
  fromPairs,
  equals,
  all,
} from 'ramda';
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
import { useSetRecoilState, useRecoilValue } from 'recoil';
import React, { useEffect } from 'react';
import { toObservable, translateDataSourceDefinitionToFetch, uqlPaginationStretagy } from './dataSourceUtils';
import {getTokensArrayFromConfig, renderJson } from "./misc";

const dataSource = (dataSourceAtom, tokenFamily) => 
{
  // dataSource changes when token change, when config change
  return ({ ds }) => {
    const setter = useSetRecoilState(dataSourceAtom); // never change
    const { type } = ds; 
    const relatedTokensId = getTokensArrayFromConfig(ds);
    const relatedTokens = map((k)=>[k,useRecoilValue(tokenFamily(k))], relatedTokensId);
    const config = renderJson({
      ...ds,
      ...fromPairs(relatedTokens)
    });
    const isEmptyString = equals('');
    const isReady = !all(isEmptyString, map((v)=>v[1], relatedTokens)) || !relatedTokens.length;
    let dataSourcefn =  fetch;
    if(type === "data" || (!isReady)){
      dataSourcefn = async () => {
        const myBlob = new Blob([JSON.stringify(config.data||[])], {type : 'application/json'});
        const init = { "status" : 200 };
        return new Response(myBlob,init);
      };
    }
    const getDataSource = toObservable(dataSourcefn);
    const params = translateDataSourceDefinitionToFetch(config);
    const res$ = getDataSource(params).pipe(
      expand((res) => {
        // this hanles multipage need change to actual implementation
        if(type==="uql" && isReady){
          return uqlPaginationStretagy(getDataSource, res);
        }
        return empty();
      }),
      takeWhile((v) => v),
      concatMap((response) => from(response.json())),
      scan((acc, value) => deepmerge(acc, value), {}),
    );
    useEffect(() => {
      res$.subscribe(setter);
      return () => {
        return res$ && res$.unsubscribe && res$.unsubscribe();
      }
    }, [ res$, setter ])
    return <div/>;
  };
};

export default dataSource;
