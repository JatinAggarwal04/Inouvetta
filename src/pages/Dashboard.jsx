import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FilterCard from '../components/FilterCard';
import TableComponent from '../components/TableComponent';

const Dashboard = () => {
  const handlePaymentFilters = ({ minBalance, maxBalance, startDate, endDate }) => {
    console.log('Applying filters:', { minBalance, maxBalance, startDate, endDate });
  };

  const handleResetFilters = () => {
    console.log('Resetting filters');
  };

  const handlePdfClick = (pdfUrl) => {
    console.log('Opening PDF:', pdfUrl);
  };

  // Example columns for the table - these would match your SQL data structure
  const columns = [
    { key: 'invoiceId', label: 'Invoice ID' },
    { key: 'vendorName', label: 'Vendor Name' },
    { key: 'balanceDue', label: 'Balance Due' },
    { key: 'dateRecieved', label: 'Date' },
    { key: 'timeReceived', label: 'Time Received' },
    { key: 'status', label: 'Status' },
    { key: 'pdfUrl', label: 'Invoice' }
  ];

  // Example empty data array - this would be replaced with your SQL data
  const data = [];

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <Navbar />
      <Sidebar />
      
      <main className="ml-[280px] pt-24 px-6">
        <h1 className="text-4xl font-serif font-bold text-gray-800 mb-8">
          Dashboard
        </h1>

        <FilterCard 
          onApplyFilters={handlePaymentFilters}
          onResetFilters={handleResetFilters}
        />

        <TableComponent 
          title="Invoices"
          columns={columns}
          data={data}
          onPdfClick={handlePdfClick}
        />
      </main>
    </div>
  );
};

export default Dashboard;