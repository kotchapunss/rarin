
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import BookingConfirmation from './components/BookingConfirmation.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/booking-confirmation" element={<BookingConfirmation />} />
    </Routes>
  </Router>
)
