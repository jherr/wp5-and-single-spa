import React, { useState, useEffect } from 'react';
import { useSetRecoilState, useRecoilState, useRecoilValue }from 'recoil';
import { map, omit, values, fromPairs} from 'ramda';
import { tokenFamily, dataAtomFamily, definitionVizAtom } from './recoilStore';
import { getTokensArrayFromConfig, renderJson } from "../utils/misc";

const vizFactory = ( tokenAtom, dataAtom ) =>{
  return ({config})=> {
    const tokens = map(([k, tk])=>[k, useRecoilValue(tk)], tokenAtom);
    const data = map((d)=>useRecoilState(d), dataAtom);
    const configWithToken = renderJson({
      ...config,
      ...fromPairs(tokens)
    });
    return <div>{
      JSON.stringify(configWithToken)
      }</div>;
  }
}

const generateViz = (vizConfig, key)=>{
  const relatedTokensId = getTokensArrayFromConfig(vizConfig);
  const relatedTokens = map((k)=>[k, tokenFamily(k)], relatedTokensId);
  const { dataSources } = vizConfig;
  const relatedDataSources = map((v)=>dataAtomFamily(v), dataSources);
  return {
    VizComp: vizFactory(relatedTokens, relatedDataSources),
    vizConfig,
    vizName: key
  }
}
const Vizs = ({defaultViz}) => {
  const setDefinitionVizAtom = useSetRecoilState(definitionVizAtom);
  const [ vizDef, setVizDef ] = useState(defaultViz);
  useEffect(() => {
    setDefinitionVizAtom(vizDef);
  }, [vizDef, setDefinitionVizAtom]);
  const [ vizPak, setVizComp ] = useState(map(generateViz, vizDef));

  const delViz = (name)=>{
    setVizComp(omit([name],vizPak));
    setVizDef(omit([name],vizDef));
  };
  const upsertViz = (name, config)=>{
    setVizComp({
      ...vizPak,
      [name]: generateViz(config, name)
    });
    setVizDef({
      ...vizDef,
      [name]: config
    })
  };

  return (
    <>
      <button onClick={()=>upsertViz("table4",{
      "title": "Demo",
      "type": "viz.Line",
      "options": {
        "a": "c",
        "b": "d"
      },
      "dataSources": {
        "primary": "sample"
      }
    })}>add</button>
    <button onClick={()=>delViz("table4")}>del</button>
    <button onClick={()=>upsertViz("table4",{
      "title": "Demo",
      "type": "viz.Line",
      "options": {
        "a": "c",
        "b": "d"
      },
      "dataSources": {
        "primary": "search1"
      }
    })}>update</button>
      {
        map(({ VizComp:V,vizConfig,vizName })=><V key={vizName} config={vizConfig}/>, values(vizPak))
      }
    </>
  );

}


export default Vizs;