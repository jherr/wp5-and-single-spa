import {
  is,
  flatten,
  match,
  map,
  values,
  dropRepeats,
} from 'ramda';
import jVar from 'json-variables';

export const getTokenFromString = (s) => {
  const isString = is(String);
  if (!isString(s)) {
    return [];
  }
  const tokensRaw = match(/\{(.*?)\}/g, s);
  const tokens = map((str) => `${str.substr(1, str.length - 2)}`, tokensRaw);
  return tokens;
};

export const flatObject = (obj) => {
  const getEntries = (o, prefix = '') =>
    Object.entries(o).flatMap(([k, v]) =>
      is(Object, v) ? getEntries(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]
    );
  return Object.fromEntries(getEntries(obj));
};

export const getTokensArrayFromConfig = (obj) => {
  const flattenedObject = flatObject(obj);
  const tokensRaw = flatten(map(getTokenFromString, values(flattenedObject)));
  const tokens = dropRepeats(tokensRaw);
  return tokens;
};

export const renderJson = (obj) =>
  jVar(obj, {
    heads: '{',
    tails: '}',
  });



export default null;