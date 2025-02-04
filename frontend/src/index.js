import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.scss';
import App from './App';
require("dotenv").config(); // ✅ Loads the .env file from the backend folder

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
