import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Remove React.StrictMode to fix drag-and-drop issues and warnings
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
