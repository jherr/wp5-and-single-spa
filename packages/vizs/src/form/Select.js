import React, {useEffect, useState} from 'react';
import { Select } from 'antd';
import {toPairs, map} from 'ramda';

const { Option } = Select;


const FormSelector = ({ states, primary:primaryDataSource }) =>{
  const [data, setdata] = useState([]);
  const { primary } = states;
  const [primaryToken, setPrimaryToken] = primary;

  useEffect(() => {
    const primary$ = primaryDataSource();
    primary$.subscribe(setdata);
    return () => primary$.unsubscribe && primary$.unsubscribe();
  }, [primary]);

  return (
    <Select value={primaryToken} style={{ width: 120 }} onChange={setPrimaryToken}>
      {
        map(([key, value])=> <Option value={value} key={key}>{key}</Option>, toPairs(data))
      }
    </Select>
  )
}

export default FormSelector;