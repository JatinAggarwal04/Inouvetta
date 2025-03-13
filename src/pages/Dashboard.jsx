import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FilterCard from '../components/FilterCard';
import TableComponent from '../components/TableComponent';
import SearchBar from '../components/SearchBar';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState([]);

  // Fetch PostgreSQL data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/invoices');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    fetchData();
  }, []);

  const handlePaymentFilters = ({ minBalance, maxBalance, startDate, endDate }) => {
    console.log('Applying filters:', { minBalance, maxBalance, startDate, endDate });
  };

  const handleResetFilters = () => {
    console.log('Resetting filters');
  };

  const handlePdfClick = (pdfUrl) => {
    console.log('Opening PDF:', pdfUrl);
  };

  const columns = [
    { key: 'invoiceId', label: 'Invoice ID' },
    { key: 'vendorName', label: 'Vendor Name' },
    { key: 'balanceDue', label: 'Balance Due' },
    { key: 'dateReceived', label: 'Date' },
    { key: 'timeReceived', label: 'Time Received' },
    { key: 'status', label: 'Status' },
    { key: 'pdfUrl', label: 'Invoice' }
  ];

  // Filter data based on search query
  const filteredData = data.filter(
    (invoice) =>
      invoice.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <Navbar />
      <Sidebar />
      
      <main className="ml-[280px] pt-24 px-6">
        <h1 className="text-4xl font-serif font-bold text-gray-800 mb-8">
          Dashboard
        </h1>

        {/* Filter Card Component */}
        <FilterCard 
          onApplyFilters={handlePaymentFilters}
          onResetFilters={handleResetFilters}
        />

        {/* Search Bar Component */}
        <SearchBar onSearch={setSearchQuery} />

        {/* Table Component with PostgreSQL data */}
        <TableComponent 
          title="Invoices"
          columns={columns}
          data={filteredData}
          onPdfClick={handlePdfClick}
        />
      </main>
    </div>
  );
};

export default Dashboard;