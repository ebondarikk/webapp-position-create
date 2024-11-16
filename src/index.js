import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

const searchParams = new URLSearchParams(window.location.search)
const categoriesJSON = searchParams.get("categories")?.toString() || "[]";
const bot_id = searchParams.get("bot_id");
const password = searchParams.get("password");
const host = searchParams.get("host");
const user_id = searchParams.get("user_id");
const message_id = searchParams.get("message_id");
tg.MainButton.setText('Сохранить');
tg.MainButton.show();

const categories = JSON.parse(categoriesJSON);

root.render(
  <React.StrictMode>
    <App tg={tg} categories={categories} bot_id={bot_id} password={password} host={host} user_id={user_id} message_id={message_id}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
