// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import './index.css' // If you have a global CSS file
import './components/GamePanels.css' // Add this
import './components/RulesPanel.css' // Add this

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)