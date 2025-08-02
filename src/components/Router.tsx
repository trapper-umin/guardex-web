import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Register from '../pages/Register';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Settings from '../pages/Settings';
import Sessions from '../pages/Sessions';
import Marketplace from '../pages/Marketplace';
import SellerDashboard from '../pages/SellerDashboard';
import CreateServer from '../pages/CreateServer';
import { ROUTES } from '../utils/routes';
import Header from './Header';
import ProtectedRoute from './ProtectedRoute';
import SellerRoute from './SellerRoute';
import GuestRoute from './GuestRoute';

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route 
          path={ROUTES.REGISTER} 
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          } 
        />
        <Route 
          path={ROUTES.LOGIN} 
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } 
        />
        <Route 
          path={ROUTES.DASHBOARD} 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTES.SETTINGS} 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTES.SESSIONS} 
          element={
            <ProtectedRoute>
              <Sessions />
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTES.MARKETPLACE} 
          element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTES.SELLER_DASHBOARD} 
          element={
            <SellerRoute>
              <SellerDashboard />
            </SellerRoute>
          } 
        />
        <Route 
          path={ROUTES.CREATE_SERVER} 
          element={
            <SellerRoute>
              <CreateServer />
            </SellerRoute>
          } 
        />
        {/* Пока что все остальные роуты ведут на главную */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router; 