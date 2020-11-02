import React from "react";
import ReactDOM from 'react-dom';
import App from './definition';
import definition from './sampleDefinition.json';
import {
  RecoilRoot,
} from 'recoil';
// const Comp = React.lazy(()=>import("remote/hub/Button"));
{/* <React.Suspense fallback={<div>loading...</div>}><Comp/></React.Suspense> */}

ReactDOM.render(<RecoilRoot><App def={definition} /></RecoilRoot>, document.getElementById('root'));