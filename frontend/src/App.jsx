import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login       from "./pages/Login";
import Register    from "./pages/Register";
import Dashboard   from "./pages/Dashboard";
import Feed        from "./pages/Feed";
import SavedPosts  from "./pages/SavedPosts";
import Admin       from "./pages/Admin";
import Layout      from "./components/layout/Layout";


function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}


function PublicRoute({ children }) {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" replace /> : children;
}


function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {}
      <Route path="/"        element={<Navigate to="/dashboard" replace />} />
      <Route path="/login"   element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard"   element={<Dashboard />} />
        <Route path="/feed"        element={<Feed />} />
        <Route path="/saved"       element={<SavedPosts />} />
        <Route path="/admin"       element={<AdminRoute><Admin /></AdminRoute>} />
      </Route>

      {}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
