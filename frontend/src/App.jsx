import React, { useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './App.css'

// Component to handle redirects from 404.html
const RedirectHandler = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const redirect = sessionStorage.redirect;
    if (redirect) {
      sessionStorage.removeItem('redirect');
      navigate(redirect, { replace: true });
    }
  }, [navigate]);
  
  return null;
};

function App() {
  return (
    <BrowserRouter>
      <RedirectHandler />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
