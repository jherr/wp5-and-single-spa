import definition from "./sampleDefinition.json";
import { is, pick, flatten, mapObjIndexed, match,map, values, dropRepeats, fromPairs, toPairs, equals, all, isEmpty } from "ramda";
import jVar from "json-variables";
import dataSourceFactory from "./utils/dataSource";
import {
    of,
} from 'rxjs';
import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
    selectorFamily,
  } from 'recoil';
import React from "react";
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import Fromlayout from './layout/FormLayout';
import getVizGirdLayout from './layout/VizGridLayout'


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
      await __webpack_init_sharing__("default");
      const container = window[scope]; // or get the container somewhere else
      // Initialize the container, it may provide shared modules
      await container.init(__webpack_share_scopes__.default);
      const factory = await window[scope].get(module);
      const Module = factory();
      return Module;
    };
}

const  renderJson = (obj) => jVar(obj,{
  heads: '{',
  tails: '}',
});
const flatObject = (obj) => {
    const getEntries = (o, prefix = '') => 
        Object.entries(o).flatMap(([k, v]) => 
            is(Object, v) ? getEntries(v, `${prefix}${k}.`) : [ [`${prefix}${k}`, v] ])
    return Object.fromEntries(getEntries(obj))
}

const getTokenFromString = ( s ) => {
    const isString = is(String);
    if(!isString(s)){
        return []
    }
    const tokensRaw = match(/\{(.*?)\}/g, s);
    const tokens = map(str => `${str.substr(1, str.length-2)}`,tokensRaw);
    return tokens;
}

const createAtomFromToken = (tokens) => {
    const tokensFlat = flatObject(tokens);

    const tokenAtoms = mapObjIndexed((value,key)=> {
        return atom({
            key:`${key}`,
            default: value,
        });
    }, tokensFlat);
    return tokenAtoms;
}

const getTokensArrayFromConfig  =  (obj) => {
    const flattenedObject = flatObject(obj);
    const tokensRaw = flatten(map(getTokenFromString, values(flattenedObject)));
    const tokens = dropRepeats(
        tokensRaw
    );
    return tokens;
}

const getVizSelectorsFromDefinition = (tokenAtoms) => ( visualizations ) => {
    return mapObjIndexed((viz, key)=>{
        return selector({
        key,
        get: ({get}) => {
            const relatedTokensId = getTokensArrayFromConfig(viz);
            const relatedTokens = map( get, pick(relatedTokensId, tokenAtoms));
            const config  = renderJson({
                ...viz,
                ...relatedTokens
            })
            return config;
        },
      })},visualizations)
}

const getDataSourceSelectorFromDefinition = (tokenAtoms) => ( dataSources ) => {
    return mapObjIndexed((dataSource, key)=> {
        return selector({
            key,
            get:({get}) => {
                const relatedTokensId = getTokensArrayFromConfig(dataSource);
                const relatedTokens = map( get, pick(relatedTokensId, tokenAtoms));
                const config  = renderJson({
                    ...dataSource,
                    ...relatedTokens
                })
                if(isEmpty(relatedTokens)){
                    return dataSourceFactory(config);
                    
                }
                const isEmptyString = equals("");
                if(all(isEmptyString, values(relatedTokens))){
                    return ()=>of([]);
                }
                return dataSourceFactory(config);
            },
        });
    },dataSources)
}

const vizFactory = ( vizKey, dataSourceSelectors, vizSelectors, dep ) =>  {
    return ( props ) => {
        const vizConfig = useRecoilValue(vizSelectors[vizKey]);
        const { dataSources, type } = vizConfig;
        const getData = map((v)=> useRecoilValue(dataSourceSelectors[v]), dataSources);
        const  Viz = dep[type];
        return <Viz {...getData} {...vizConfig}/>
    };
}

const formFactory = ( formConfig, tokenAtoms, dataSourceSelectors, dep ) => {
    const { dataSources=[], type } = formConfig;
    const tokensArray = values(formConfig.tokens);
    const relatedTokenAtoms = pick(tokensArray, tokenAtoms);
    return (props) => {
        const states = map((v)=>{
            return useRecoilState(relatedTokenAtoms[v])
        },formConfig.tokens);
        const getData = map((v)=> useRecoilValue(dataSourceSelectors[v]), dataSources);

        const  Form  = dep[type]
        
        return <Form states={states} {...getData}/>
    }
}

const importVizAndForm = (def) => {
    const { forms, visualizations:viz } = def;
    const vizComponent = dropRepeats(values(map(({type})=> type, viz)));
    const formcomponent = dropRepeats(values(map(({type})=> type, forms)));
    return fromPairs(map((p)=>{
        return [p, React.lazy(loadComponent('resources',`./${p}`))]
    },  [...vizComponent, ...formcomponent]));
}

const DashboardCore = ( def )=> {
    const { forms, visualizations:viz } = def;
    const dataSource = definition.dataSources; 
    const dependency = importVizAndForm(definition);
    const tokenAtoms = createAtomFromToken(definition.tokens);
    const dataSourceSelectors = getDataSourceSelectorFromDefinition(tokenAtoms)(dataSource);
    const vizSelectors = getVizSelectorsFromDefinition(tokenAtoms)(viz);
    const vizComponents = mapObjIndexed((v, k)=> vizFactory(k, dataSourceSelectors, vizSelectors, dependency), viz );
    const formComponents = map((v)=> formFactory(v, tokenAtoms,dataSourceSelectors, dependency), forms );
    const VizGirdLayout = getVizGirdLayout(definition.layout)
    return ( props )=>{
        return (<RecoilRoot>
            <React.Suspense fallback={<div>Loading...</div>}>
            <Fromlayout>
                {
                    map( 
                        ([key,V])=><Fromlayout.Item key={key}><V/></Fromlayout.Item>,
                        toPairs(formComponents)
                    )
                }
            </Fromlayout>
            <VizGirdLayout>
                {
                    map( 
                        ([key,V])=><V key={key}/>,
                            toPairs(vizComponents)
                    )
                }
            </VizGirdLayout>
            </React.Suspense>
        </RecoilRoot>);
    }
}


export default DashboardCore(definition);

// const footerLifecycles = singleSpaReact({
//     React,
//     ReactDOM,
//     rootComponent: DashboardCore(definition)
//   });
  
//   export const bootstrap = footerLifecycles.bootstrap;
//   export const mount = footerLifecycles.mount;
//   export const unmount = footerLifecycles.unmount;