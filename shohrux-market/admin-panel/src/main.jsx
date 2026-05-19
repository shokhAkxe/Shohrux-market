import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AdminProvider } from './context/AdminContext' // Providerni import qilamiz

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminProvider> {/* App'ni Provider ichiga olamiz */}
      <App />
    </AdminProvider>
  </React.StrictMode>,
)