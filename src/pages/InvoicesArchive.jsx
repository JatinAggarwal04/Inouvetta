import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import FilterCard from "../components/FilterCard";
import TableComponent from "../components/TableComponent";
import SearchBar from "../components/SearchBar";
import supabase from "../supabaseClient";

const InvoicesArchive = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [rawData, setRawData] = useState({ invoices: [], vendors: [] });

  // ✅ Fetch raw data (Invoices + Vendors)
  const fetchDetails = async () => {
    try {
      // ✅ Fetch invoices
      const { data: invoices, error: invoicesError } = await supabase.from("invoices").select("*");

      // ✅ Fetch vendors (for vendor_name & gstin)
      const { data: vendors, error: vendorsError } = await supabase.from("vendors_db").select("vendor_id, vendor_name, gstin");

      if (invoicesError) console.error("Error fetching invoices:", invoicesError);
      if (vendorsError) console.error("Error fetching vendors:", vendorsError);

      setRawData({ invoices: invoices || [], vendors: vendors || [] });
    } catch (err) {
      console.error("Unexpected error while fetching data:", err);
    }
  };

  // ✅ Process and merge data
  const generateTableData = () => {
    const { invoices, vendors } = rawData;

    // ✅ Create a lookup for vendor_name and gstin
    const vendorMap = {};
    vendors.forEach((vendor) => {
      vendorMap[vendor.vendor_id] = { vendor_name: vendor.vendor_name, gstin: vendor.gstin };
    });

    return invoices.map((invoice) => ({
      order_id: invoice.order_id,
      invoice_no: invoice.invoice_no,
      order_date: invoice.order_date,
      total_amount: invoice.total_amount ? `₹${invoice.total_amount}` : "N/A",
      cgst_amount: invoice.cgst_amount ? `₹${invoice.cgst_amount}` : "N/A",
      sgst_amount: invoice.sgst_amount ? `₹${invoice.sgst_amount}` : "N/A",
      igst_amount: invoice.igst_amount ? `₹${invoice.igst_amount}` : "N/A",
      vendor_name: vendorMap[invoice.vendor_id]?.vendor_name || "Unknown Vendor",
      gstin: vendorMap[invoice.vendor_id]?.gstin || "N/A",
    }));
  };

  // ✅ Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching invoice details...");
      await fetchDetails();
    };

    fetchData();
  }, []);

  // ✅ Process data when rawData updates
  useEffect(() => {
    if (rawData.invoices.length) {
      const processedData = generateTableData();
      console.log("Processed Data:", processedData);
      setTableData(processedData);
      setFilteredData(processedData);
    }
  }, [rawData]);

  // ✅ Apply Filters
  const handleApplyFilters = ({ minBalance, maxBalance, startDate, endDate }) => {
    let filtered = [...tableData];

    if (minBalance) {
      filtered = filtered.filter((item) => parseFloat(item.total_amount.replace("₹", "")) >= minBalance);
    }
    if (maxBalance) {
      filtered = filtered.filter((item) => parseFloat(item.total_amount.replace("₹", "")) <= maxBalance);
    }
    if (startDate && endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.order_date);
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
      String(invoice.invoice_no).toLowerCase().includes(lowerSearch) ||
      (invoice.vendor_name && invoice.vendor_name.toLowerCase().includes(lowerSearch))
    );
  });

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <Navbar />
      <Sidebar />

      <main className="ml-[280px] pt-24 px-6">
        <h1 className="text-4xl font-serif font-bold text-gray-800 mb-8">
          Invoices Archive
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
          title="Invoices Archive" 
          columns={[
            { key: "order_id", label: "Order ID" },
            { key: "invoice_no", label: "Invoice No" },
            { key: "vendor_name", label: "Vendor Name" },
            { key: "gstin", label: "GSTIN" },
            { key: "order_date", label: "Order Date" },
            { key: "total_amount", label: "Total Amount" },
            { key: "cgst_amount", label: "CGST Amount" },
            { key: "sgst_amount", label: "SGST Amount" },
            { key: "igst_amount", label: "IGST Amount" },
          ]} 
          data={searchFilteredData} 
        />
      </main>
    </div>
  );
};

export default InvoicesArchive;