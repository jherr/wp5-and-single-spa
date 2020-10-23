import definition from "./sampleDefinition.json";
import { pick, flatten, mapObjIndexed, is, match,map, values, dropRepeats, fromPairs, toPairs, equals, all } from "ramda";
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
                const isEmptyString = equals("");
                if(all(isEmptyString, values(relatedTokens))){
                    return ()=>of([]);
                }
                const getResult = dataSourceFactory(config);
                return getResult;
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

const formFactory = ( formConfig, tokenAtoms, dep ) => {
    const tokensArray = values(formConfig.tokens);
    const relatedTokenAtoms = pick(tokensArray, tokenAtoms);
    return (props) => {
        const { type } = formConfig;
        const states = map((v)=>{
            return useRecoilState(relatedTokenAtoms[v])
        },formConfig.tokens);
        const  Form  = dep[type]
        
        return <Form states={states}/>
    }
}
const importVizAndForm = (definition) => {
    const viz = definition.visualizations;
    const forms = definition.forms;
    const vizComponent = dropRepeats(values(map(({type})=> type, viz)));
    const formcomponent = dropRepeats(values(map(({type})=> type, forms)));
    return fromPairs(map((p)=>[p, React.lazy(()=>import(`./${p}`))],  [...vizComponent, ...formcomponent]));
}

const DashboardCore = ( definition )=> {
    const viz = definition.visualizations;
    const forms = definition.forms;
    const dataSource = definition.dataSources; 
    const dependency = importVizAndForm(definition);
    const tokenAtoms = createAtomFromToken(definition.tokens);
    const dataSourceSelectors = getDataSourceSelectorFromDefinition(tokenAtoms)(dataSource);
    const vizSelectors = getVizSelectorsFromDefinition(tokenAtoms)(viz);
    const vizComponents = mapObjIndexed((v, k)=> vizFactory(k, dataSourceSelectors, vizSelectors, dependency), viz );
    const formComponents = map((v)=> formFactory(v, tokenAtoms,dependency), forms );
    return ( props )=>{
        return (<RecoilRoot>
            <React.Suspense fallback={<div>Loading...</div>}>
            {
                map( 
                    ([key,V])=><V key={key}/>,
                        toPairs(vizComponents)
                )
            }
            <div>
                {
                    map( 
                        ([key,V])=><V key={key}/>,
                        toPairs(formComponents)
                    )
                }
            </div>
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