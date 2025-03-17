import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import { Analytics } from "@vercel/analytics/react";
import InvoicesArchive from "./pages/InvoicesArchive";
import FlaggedForReview from "./pages/FlaggedForReview";
import PurchaseOrders from "./pages/PurchaseOrders";
import Login from "./pages/Login"; // Make sure this path is correct

// Protected route component
const ProtectedRoute = ({ children }) => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  if (!isLargeScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-purple-600 z-50 flex items-center justify-center p-4">
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-2xl max-w-md w-full p-8 text-center transform transition-all hover:scale-105">
          <div className="mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-24 h-24 mx-auto text-white mb-4 animate-pulse"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Large Screen Required</h2>
          <p className="text-white/80 text-lg mb-6">
            The prototype is compatible with large screen sizes.
          </p>
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <p className="text-white/70 text-sm">
              Minimum screen width: 1024 pixels
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Router>
      <Routes>
        {/* Login route comes first */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/invoices-archive" element={<ProtectedRoute><InvoicesArchive /></ProtectedRoute>} />
        <Route path="/flagged-review" element={<ProtectedRoute><FlaggedForReview /></ProtectedRoute>} />
        <Route path="/purchase-order" element={<ProtectedRoute><PurchaseOrders /></ProtectedRoute>} />
        
        {/* Root route redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <Analytics />
    </Router>
  );
};

export default App;