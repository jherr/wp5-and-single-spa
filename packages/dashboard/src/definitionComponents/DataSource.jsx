import {
  useSetRecoilState,
  useRecoilValue
} from 'recoil';
import {
  mapObjIndexed,
  map,
  values,
  omit,
} from 'ramda';
import React, { useState, useEffect } from 'react';
import dataSourceFactory from '../utils/dataSource';
import { dataAtomFamily, tokenFamily, definitionDataSourceAtom } from './recoilStore';


// only this component can change data and definitionDataSource atoms

const Test = ( {k} )=> {
  const data = useRecoilValue(dataAtomFamily(k));
return <div>{JSON.stringify(data)}</div>
}

const useDataSources = (defaultDataSource={}) =>{
  const [dataSources, setDataSources] = useState(defaultDataSource);
  const setDataSourceAtom = useSetRecoilState(definitionDataSourceAtom);
  useEffect(()=>setDataSourceAtom(dataSources), [ dataSources, setDataSourceAtom ]);
  const upsertDataSource = (name, config)=> {
    setDataSources({
      ...dataSources,
      [name]: config
    });
  };
  const deleteDataSource = (name) =>{
    setDataSources(omit(name,dataSources));
  };

  return [dataSources, upsertDataSource, deleteDataSource];
}

const generateDataStore = (config, dataSourceName)=> ({
  Comp: dataSourceFactory(dataAtomFamily(dataSourceName), tokenFamily),
  key: dataSourceName,
  config
});
const DataSources = ({defaultDataSource}) =>{
  const [dataSources, upsertDataSource, deleteDataSource] = useDataSources(defaultDataSource); 
  const [DataSourceStores, setDataSourceStores] = useState(mapObjIndexed(generateDataStore, dataSources));
  const updateDataStore = (name, config) => {
    const DataStoreWithoutName = omit([name], DataSourceStores);
    setDataSourceStores({...DataStoreWithoutName, [name]:generateDataStore(config, name)});
    upsertDataSource(name, config);
  }
  const deleteDataStore = (name) => {
    const DataStoreWithoutName = omit([name], DataSourceStores);
    setDataSourceStores(DataStoreWithoutName);
    deleteDataSource(name);
  }

  const addDataStore = (name, config) => {
    const res = {...DataSourceStores, [name]:generateDataStore(config, name)}
    setDataSourceStores(res);
    upsertDataSource(name, config);
  }

  const DataSourceStoresArray = values(DataSourceStores);

  return (<>
   {map(({Comp, key, config})=><Comp key={key} ds={config} />,DataSourceStoresArray)}
   {map(({key})=><Test key={key} k={key} />,DataSourceStoresArray)}

   <button onClick={()=> addDataStore(
     "search5",{
      "type": "uql",
      "query": "http://localhost:3000/posts?_page={value}",
      "a": "c",
      "b": "d"
    },
   ) }>add</button>
    <button onClick={()=> updateDataStore(
     "search1",{
      "type": "uql",
      "query": "http://localhost:3000/posts?_page={value1}",
      "a": "c",
      "b": "d"
    },
   ) }>update</button>
   <button onClick={()=> deleteDataStore(
     "search1") }>del</button>
  </>);
}

export default DataSources;