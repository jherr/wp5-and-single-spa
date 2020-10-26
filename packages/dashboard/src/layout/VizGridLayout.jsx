import { Col, Row } from 'antd/lib/grid';
import React from 'react';
import { map, fromPairs, join } from 'ramda';

const SPAN = 24;

const getVizGirdLayout = (gridDefinition) => {
  return ({ children }) => {
    const { structure } = gridDefinition;
    const childrenWithKey = fromPairs(
      map((child) => [child.key, child], children)
    );

    return (
      <>
        {map(
          (row) => (
            <Row key={join('-', row)}>
              {map(
                (item) => (
                  <Col key={item} span={SPAN / row.length}>
                    {childrenWithKey[item]}
                  </Col>
                ),
                row
              )}
            </Row>
          ),
          structure
        )}
      </>
    );
  };
};

export default getVizGirdLayout;
