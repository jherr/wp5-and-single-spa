import styled from 'styled-components';
import React from 'react';

const FormLayoutContainer = styled.div`
  display: flex;
  justify-content: start;
`;

const FormLayoutItem = styled.div`
  margin: 5px;
`;

const FormLayout = ({ children }) => {
  return (
    <FormLayoutContainer>
      {
        children
      }
    </FormLayoutContainer>
  );
};
FormLayout.Item = FormLayoutItem;

export default FormLayout;
