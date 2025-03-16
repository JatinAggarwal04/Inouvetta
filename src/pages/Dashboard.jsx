import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FilterCard from '../components/FilterCard';
import TableComponent from '../components/TableComponent';
import SearchBar from '../components/SearchBar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Fetch PostgreSQL data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/invoices');
        const result = await response.json();
        setData(result);
        setFilteredData(result); // Initialize filtered data
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    fetchData();
  }, []);

  const handlePaymentFilters = ({ minBalance, maxBalance, startDate, endDate }) => {
    let filtered = [...data];

    if (minBalance) {
      filtered = filtered.filter(invoice => invoice.balanceDue >= minBalance);
    }
    if (maxBalance) {
      filtered = filtered.filter(invoice => invoice.balanceDue <= maxBalance);
    }
    if (startDate && endDate) {
      filtered = filtered.filter(invoice => {
        const invoiceDate = new Date(invoice.dateReceived);
        return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
      });
    }

    setFilteredData(filtered);
  };

  const handleResetFilters = () => {
    setFilteredData(data);
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

  // Process chart data
  const processChartData = () => {
    const groupedData = {};

    filteredData.forEach((invoice) => {
      const date = invoice.dateReceived;
      if (!groupedData[date]) {
        groupedData[date] = { date, received: 0, approved: 0, rejected: 0 };
      }

      groupedData[date].received += 1;
      if (invoice.status === 'Approved') {
        groupedData[date].approved += 1;
      } else if (invoice.status === 'Rejected') {
        groupedData[date].rejected += 1;
      }
    });

    return Object.values(groupedData);
  };

  const chartData = processChartData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm p-4 shadow-lg rounded-lg border">
          <p className="font-semibold border-b pb-2 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="flex items-center gap-2 py-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span style={{ color: entry.color }} className="font-medium">
                {entry.value} {entry.name}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartProps = {
    isAnimationActive: true,
    animationBegin: 0,
    animationDuration: 800,
    animationEasing: "linear",
  };

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
          tableData={searchFilteredData}
        />

        {/* Graph Cards */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <h2 className="text-xl font-semibold mb-4">Invoices Received</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fill: "#666" }} />
                  <YAxis tick={{ fill: "#666" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar name="Received" dataKey="received" fill="#2563eb" radius={[4, 4, 0, 0]} {...chartProps} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <h2 className="text-xl font-semibold mb-4">Invoices Approved</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fill: "#666" }} />
                  <YAxis tick={{ fill: "#666" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar name="Approved" dataKey="approved" fill="#16a34a" radius={[4, 4, 0, 0]} {...chartProps} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <h2 className="text-xl font-semibold mb-4">Invoices Rejected</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fill: "#666" }} />
                  <YAxis tick={{ fill: "#666" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar name="Rejected" dataKey="rejected" fill="#dc2626" radius={[4, 4, 0, 0]} {...chartProps} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Search Bar Component */}
        <SearchBar onSearch={setSearchQuery} />

        {/* Table Component with PostgreSQL data */}
        <TableComponent 
          title="Invoices"
          columns={columns}
          data={filteredData.filter(
            (invoice) =>
              invoice.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
              invoice.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          onPdfClick={handlePdfClick}
        />
      </main>
    </div>
  );
};

export default Dashboard;