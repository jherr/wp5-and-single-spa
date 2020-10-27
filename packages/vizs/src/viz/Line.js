import React, {useEffect, useState}from 'react';
import { Chart, LineAdvance } from 'bizcharts';

function Demo( {primary} ) {
  const [data, setdata] = useState([]);
  useEffect(() => {
    const primary$ = primary();
    primary$.subscribe(setdata);
    return () => primary$.unsubscribe && primary$.unsubscribe();
  }, [primary]);
	return <Chart padding={[10, 20, 50, 40]} autoFit height={300} data={data} >
		<LineAdvance
			shape="smooth"
			point
			area
			position="month*temperature"
			color="city"
		/>
	</Chart>
}

export default Demo;