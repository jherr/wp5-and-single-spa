
import {
  is,
  pick,
  flatten,
  mapObjIndexed,
  match,
  map,
  values,
  dropRepeats,
  fromPairs,
  toPairs,
  equals,
  all,
  isEmpty,
  keys,
} from 'ramda';
import {
  BehaviorSubject
} from 'rxjs';

import jVar from 'json-variables';
import { of } from 'rxjs';
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  atomFamily,
  selectorFamily,
  useSetRecoilState
} from 'recoil';
import React, { useState } from 'react';
// import ReactDOM from 'react-dom';
// import singleSpaReact from 'single-spa-react';
import styled from 'styled-components';
import Fromlayout from './layout/FormLayout';
import getVizGirdLayout from './layout/VizGridLayout';
import dataSourceFactory from './utils/dataSource';
import definition from './sampleDefinition.json';

import { dataAtomFamily, tokenFamily} from './definitionComponents/recoilStore';
import DataSource from "./definitionComponents/DataSource";
import Token from "./definitionComponents/Token";
import Viz from "./definitionComponents/Visualization";
import Forms from "./definitionComponents/Forms";

const DashboardContainer = styled.div`
  margin: 10px;
`;

/*
    1.token
    2.viz (can't change individually)
    3.layout (can't change individually)
    4.dataSource

    reation chain: 
    defintion change --> all change
    token change --> everything token related changes
    dataSource change --> viz change 
*/

function loadComponent(scope, module) {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    await __webpack_init_sharing__('default');
    const container = window[scope]; // or get the container somewhere else
    // Initialize the container, it may provide shared modules
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(module);
    const Module = factory();
    return Module;
  };
}

const renderJson = (obj) =>
  jVar(obj, {
    heads: '{',
    tails: '}',
  });
const flatObject = (obj) => {
  const getEntries = (o, prefix = '') =>
    Object.entries(o).flatMap(([k, v]) =>
      is(Object, v) ? getEntries(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]
    );
  return Object.fromEntries(getEntries(obj));
};

const getTokenFromString = (s) => {
  const isString = is(String);
  if (!isString(s)) {
    return [];
  }
  const tokensRaw = match(/\{(.*?)\}/g, s);
  const tokens = map((str) => `${str.substr(1, str.length - 2)}`, tokensRaw);
  return tokens;
};

const createAtomFromToken = (tokens) => {
  const tokensFlat = flatObject(tokens);

  const tokenFamily =  ({
    key: `tokenAtomFamily`,
    default: (key) => tokens[key],
  });
  // const tokenAtoms = mapObjIndexed((value, key) => {
  //   return atom({
  //     key: `${key}`,
  //     default: value,
  //   });
  // }, tokensFlat);

  // return tokenAtoms;
  return tokenFamily;
};

const getTokensArrayFromConfig = (obj) => {
  const flattenedObject = flatObject(obj);
  const tokensRaw = flatten(map(getTokenFromString, values(flattenedObject)));
  const tokens = dropRepeats(tokensRaw);
  return tokens;
};

const getVizSelectorsFromDefinition = (token, tokenFamily) => (visualizations) => {
  return mapObjIndexed((viz, key) => {
    return selector({
      key,
      get: ({ get }) => {
        const relatedTokensId = getTokensArrayFromConfig(viz);

        const relatedTokens = mapObjIndexed((v,k)=>get(tokenFamily(k)), pick(relatedTokensId, token));
        const config = renderJson({
          ...viz,
          ...relatedTokens,
        });
        return config;
      },
    });
  }, visualizations);
};

const getDataSourceSelectorFromDefinition = (tokensAtom, tokenFamily) => (dataSources) => {
  return mapObjIndexed((dataSource, key) => {
    return selector({
      key,
      get: ({ get }) => {
        const relatedTokensId = getTokensArrayFromConfig(dataSource);
        const token = get(tokensAtom);
        const relatedTokens = mapObjIndexed((v, k)=>get(tokenFamily(k)), pick(relatedTokensId, token));
        const config = renderJson({
          ...dataSource,
          ...relatedTokens,
        });
        if (isEmpty(relatedTokens)) {
          return dataSourceFactory(config);
        }
        const isEmptyString = equals('');
        if (all(isEmptyString, values(relatedTokens))) {
          return () => of([]);
        }
        return dataSourceFactory(config);
      },
    });
  }, dataSources);
};



const formFactory = (formConfig, token, tokenFamily, dataSourceFamily, dep) => {
  const { dataSources = [], type } = formConfig;
  const tokensArray = values(formConfig.tokens);
  const relatedTokenAtoms = mapObjIndexed((v,k)=>tokenFamily(k), pick(tokensArray, token));
  return (props) => {
    const states = map((v) => {
      return useRecoilState(relatedTokenAtoms[v]);
    }, formConfig.tokens);
    const getData = map(
      (v) => useRecoilValue(dataSourceFamily(v)),
      dataSources
    );

    const Form = dep[type];

    return <Form states={states} {...getData} />;
  };
};

const importVizAndForm = (def) => {
  const { forms, visualizations: viz } = def;
  const vizComponent = dropRepeats(values(map(({ type }) => type, viz)));
  const formcomponent = dropRepeats(values(map(({ type }) => type, forms)));
  return fromPairs(
    map(
      (p) => {
        return [p, React.lazy(loadComponent('resources', `./${p}`))];
      },
      [...vizComponent, ...formcomponent]
    )
  );
};




const DashboardCore = (def) => {
  const { forms, visualizations: viz , tokens, dataSources: dataSource } = def;

  // const vizFactory = (vizKey, dataSourceFamily, vizFamily, dep) => {
  //   return (props) => {
  //     const vizConfig = useRecoilValue(vizFamily(vizKey));
  //     const { dataSources, type } = vizConfig;
  //     const subs = map(
  //       (v) => useRecoilValue(dataSourceFamily(v)),
  //       dataSources
  //     )
  //     const getData = map(
  //       (v) => useRecoilValue(dataSourceAtoms[v]),
  //       dataSources
  //     );
  //     const Viz = dep[type];
  //     // <Viz {...getData} {...vizConfig} />
  //     return <div></div>;
  //   };
  // };
  // const dependency = importVizAndForm(definition);
  // const vizAtom = atom({key:"vizAtom", default: viz});
  // const formsAtom = atom({key:"formsAtom", default: forms});
  // const dataSourceAtom = atom({key:"dataSourceAtom", default: dataSource});

  
  // const dataSourceFamily = selectorFamily({
  //     key: 'dataSourceFamily/Default',
  //     get: key => ({get}) => {
  //       const ds = get(dataSourceAtom)[key];
  //       const relatedTokensId = getTokensArrayFromConfig(ds);
  //       const relatedTokens = map((k)=>[k,get(tokenFamily(k))], relatedTokensId);
  //       const config = renderJson({
  //         ...ds,
  //         ...fromPairs(relatedTokens)
  //       });
  //       const isEmptyString = equals('');
  //       const isReady = !all(isEmptyString, map((v)=>v[1], relatedTokens));
  //       return dataS[key](config, isReady);
  //     },
  // });
  

  // const vizFamily = selectorFamily({
  //     key: 'vizFamily/Default',
  //     get: key => ({get}) => {
  //       const v = get(vizAtom)[key];
  //       const relatedTokensId = getTokensArrayFromConfig(v);
  //       const relatedTokens = map((k)=>[k,get(tokenFamily(k))], relatedTokensId);
  //       const config = renderJson({
  //         ...v,
  //         ...fromPairs(relatedTokens)
  //       });
  //       return config;
  //     },
  //     // set: key => ({set}, newValue)
  //   });

  // const formFamily = atomFamily({
  //   key: `formFamily`,
  //   default: (key)=> forms[key]
  // });

 
  // const VizGirdLayout = getVizGirdLayout(definition.layout);
 
  return (props) => {
    return (
      <>
        <DataSource defaultDataSource={dataSource} />
        <Token defaultToken = {tokens}/>
        <Viz defaultViz={viz}/>
        <Forms defaultForm={forms}/>
      </>
    );
  };
};

export default DashboardCore(definition);

// const footerLifecycles = singleSpaReact({
//     React,
//     ReactDOM,
//     rootComponent: DashboardCore(definition)
//   });

//   export const bootstrap = footerLifecycles.bootstrap;
//   export const mount = footerLifecycles.mount;
//   export const unmount = footerLifecycles.unmount;
