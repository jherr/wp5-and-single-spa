import React, { useEffect, useState } from 'react';

const Table = ({ primary, ...rest }) => {
  const [data, setdata] = useState([]);
  useEffect(() => {
    const primary$ = primary();
    primary$.subscribe(setdata);
    return () => primary$.unsubscribe && primary$.unsubscribe();
  }, [primary]);

  return (
    <>
      <div> {rest.title} </div>
      <div>{Math.random()}</div> <div> {JSON.stringify(data)} </div>
    </>
  );
};

export default Table;
