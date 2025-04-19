import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../imgs/Icon.svg';

const NextPageButton = ({ nextPage }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="next-page-button"
      onClick={() => navigate(nextPage)}
      role="button"
      tabIndex={0}
    >
      <img src={Icon} alt="Next Page" />
    </div>
  );
};

export default NextPageButton; 