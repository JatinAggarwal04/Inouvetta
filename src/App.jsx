import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import InvoicesArchive from "./pages/InvoicesArchive";  
import FlaggedForReview from "./pages/FlaggedForReview"; 
import PurchaseOrders from "./pages/PurchaseOrders";  

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/invoices-archive" element={<InvoicesArchive />} />
        <Route path="/flagged-review" element={<FlaggedForReview />} />  
        <Route path="/purchase-order" element={<PurchaseOrders />} />  
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;