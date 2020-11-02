import React, { useState, useEffect } from 'react';
import { useSetRecoilState, useRecoilState, useRecoilValue }from 'recoil';
import { map, omit, values, fromPairs} from 'ramda';
import { tokenFamily, dataAtomFamily, definitionFormAtom } from './recoilStore';
import { getTokensArrayFromConfig, renderJson } from "../utils/misc";

const formFactory = ( tokenAtom, dataAtom ) =>{
  return ({config})=> {
    const tokens = map(([k, tk])=>[k, useRecoilValue(tk)], tokenAtom);
    const data = map((d)=>useRecoilState(d), dataAtom);
    const configWithToken = renderJson({
      ...config,
      ...fromPairs(tokens)
    });
    return <div>{
      JSON.stringify(data)
      }</div>;
  }
}

const generateViz = (vizConfig, key)=>{
  const relatedTokensId = values(vizConfig.tokens);
  const relatedTokens = map((k)=>[k, tokenFamily(k)], relatedTokensId);
  const { dataSources } = vizConfig;
  let relatedDataSources={};
  if(dataSources){
    relatedDataSources = map((v)=>dataAtomFamily(v), dataSources);
  }
  return {
    VizComp: formFactory(relatedTokens, relatedDataSources),
    vizConfig,
    vizName: key
  }
}
const Forms = ({defaultForm}) => {
  const setDefinitionVizAtom = useSetRecoilState(definitionFormAtom);
  const [ formDef, setVizDef ] = useState(defaultForm);
  useEffect(() => {
    setDefinitionVizAtom(formDef);
  }, [formDef, setDefinitionVizAtom]);
  const [ formPak, setVizComp ] = useState(map(generateViz, formDef));

  const delViz = (name)=>{
    setVizComp(omit([name],formPak));
    setVizDef(omit([name],formDef));
  };
  const upsertViz = (name, config)=>{
    setVizComp({
      ...formPak,
      [name]: generateViz(config, name)
    });
    setVizDef({
      ...formDef,
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
        map(({ VizComp:V,vizConfig,vizName })=><V key={vizName} config={vizConfig}/>, values(formPak))
      }
    </>
  );

}


export default Forms;