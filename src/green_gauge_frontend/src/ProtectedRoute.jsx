import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, redirectPath = '/' }) => {
    const location = useLocation();

    return isAuthenticated ? (
        <Outlet />
    ) : (
        <Navigate to={redirectPath} state={{ from: location }} replace />
    );
};

export default ProtectedRoute;
