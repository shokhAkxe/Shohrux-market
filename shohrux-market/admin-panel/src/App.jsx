import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Messages from './pages/Messages';
import AdminManagement from './pages/AdminManagement';
import UsersPage from './pages/Users';
import Orders from './pages/Orders';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/admin" element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="products" element={<Products />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="messages" element={<Messages />} />
                        <Route path="management" element={<AdminManagement />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
