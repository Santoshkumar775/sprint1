import React from 'react';
import { useParams } from 'react-router-dom';

const EditLog = () => {
  const { id } = useParams();
  return <h1>Edit Log with ID: {id}</h1>;
};

export default EditLog;
