import React, { useState, useEffect } from 'react';
import {
  useSetRecoilState,
  useRecoilState,
  useRecoilValue
} from 'recoil';
import {
  omit,
  values,
  map,
  mapObjIndexed,
} from 'ramda';
import { tokenFamily, definitionTokenAtom } from './recoilStore';


const TokenStore = ({tokenAtom, name}) => {
  const [ tokenValue, setTokenValue ] = useRecoilState(tokenAtom);
return (
  <div>
    {
      tokenValue
    }
    <button onClick={()=>setTokenValue(1)}>{name}</button>
  </div>
);
}


const Token = ({defaultToken}) => {
  const [defToken, setDefToken] = useState(defaultToken);
  const setDefTokenAtom = useSetRecoilState(definitionTokenAtom);
  useEffect(() => {
    setDefTokenAtom(defToken);
  }, [defToken, setDefTokenAtom]);
  const upsertToken = (k, v) =>setDefToken({
    ...defToken,
    [k]: v
  });
  const delToken = (k) =>setDefToken(omit([k],defToken));

  const TokenFamily = mapObjIndexed((v,k)=>(<TokenStore key={k} tokenAtom={tokenFamily(k)} name={k}/>),defToken);
  return (
    <>
      {
        map((V)=>V, values(TokenFamily))
      }
    </>
  );
};

export default Token;
