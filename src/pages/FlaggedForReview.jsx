import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import FilterCard from "../components/FilterCard";
import TableComponent from "../components/TableComponent";
import SearchBar from "../components/SearchBar";
import supabase from "../supabaseClient";

const FlaggedForReview = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // ✅ Fetch flagged invoices data
  const fetchDetails = async () => {
    try {
      // ✅ Fetch flagged invoices
      const { data: flaggedInvoices, error: flaggedError } = await supabase.from("flagged").select("*");

      if (flaggedError) console.error("Error fetching flagged invoices:", flaggedError);

      setTableData(flaggedInvoices || []);
      setFilteredData(flaggedInvoices || []);
    } catch (err) {
      console.error("Unexpected error while fetching data:", err);
    }
  };

  // ✅ Fetch data on component mount
  useEffect(() => {
    fetchDetails();
  }, []);

  // ✅ Apply Filters
  const handleApplyFilters = ({ startDate, endDate }) => {
    let filtered = [...tableData];

    if (startDate && endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.invoice_date);
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
      });
    }

    setFilteredData(filtered);
  };

  // ✅ Reset Filters
  const handleResetFilters = () => {
    setFilteredData(tableData);
  };

  // ✅ Apply Search
  const searchFilteredData = filteredData.filter((invoice) => {
    if (!searchQuery) return true;
    const lowerSearch = searchQuery.toLowerCase();
    return (
      String(invoice.order_id).toLowerCase().includes(lowerSearch) ||
      String(invoice.invoice_id).toLowerCase().includes(lowerSearch) ||
      (invoice.vendor_name && invoice.vendor_name.toLowerCase().includes(lowerSearch))
    );
  });

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <Navbar />
      <Sidebar />

      <main className="ml-[280px] pt-24 px-6">
        <h1 className="text-4xl font-serif font-bold text-gray-800 mb-8">
          Flagged for Review
        </h1>

        {/* ✅ Pass filter functions to FilterCard */}
        <FilterCard 
          onApplyFilters={handleApplyFilters} 
          onResetFilters={handleResetFilters} 
        />

        {/* ✅ SearchBar now updates `searchQuery` */}
        <SearchBar onSearch={setSearchQuery} />

        {/* ✅ Pass the filtered & searched data to TableComponent */}
        <TableComponent 
          title="Flagged Invoices" 
          columns={[
            { key: "order_id", label: "Order ID" },
            { key: "invoice_id", label: "Invoice ID" },
            { key: "vendor_name", label: "Vendor Name" },
            { key: "invoice_date", label: "Invoice Date" },
          ]} 
          data={searchFilteredData} 
        />
      </main>
    </div>
  );
};

export default FlaggedForReview;