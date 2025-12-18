import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Initialize theme (dark/light) synchronously so it persists on refresh
try {
  const storedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
} catch (e) {
  // If access to localStorage is blocked, fail silently
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);