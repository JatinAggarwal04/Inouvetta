import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import FilterCard from "../components/FilterCard";
import TableComponent from "../components/TableComponent";
import SearchBar from "../components/SearchBar";
import supabase from "../supabaseClient";

const PurchaseOrders = () => {
  const [searchQuery, setSearchQuery] = useState(""); // ✅ Keeps track of search input
  const [tableData, setTableData] = useState([]);
  const [vendors, setVendors] = useState([]);

  // ✅ Fetch Vendors (Kept Same)
  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase.from("vendors_db").select("vendor_name");

      if (error) {
        console.error("Error fetching vendors from Supabase:", error);
        return [];
      }

      const vendorNames = data.map((item) => item.vendor_name);
      setVendors(vendorNames);
    } catch (err) {
      console.error("Unexpected error while fetching vendors:", err);
    }
  };

  // ✅ Fetch Purchase Orders (Kept Same)
  const generateTableData = async () => {
    try {
      const { data, error } = await supabase.from("purchase_orders").select("*");

      if (error) {
        console.error("Error fetching data from Supabase:", error);
        return [];
      }

      await fetchVendors(); // Fetch vendors separately

      const formattedData = data.map((item) => ({
        ...item,
        balanceDue: parseFloat(item.total_amount || "0"),
        status: "Unsettled",
      }));

      return formattedData || [];
    } catch (err) {
      console.error("Unexpected error while fetching data:", err);
      return [];
    }
  };

  // ✅ Fetch Data on Component Load
  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching purchase orders...");
      const data = await generateTableData();
      console.log("Fetched Data:", data); // 🔍 Check if data is being fetched
      setTableData(data);
    };

    fetchData();
  }, []);

  // ✅ Apply Search Filter (Fixes the issue)
  const searchFilteredData = tableData.filter((order) => {
    if (!searchQuery) return true; // ✅ If search is empty, show all data
  
    const lowerSearch = searchQuery.toLowerCase();
    return (
      String(order.order_id).toLowerCase().includes(lowerSearch) || // ✅ Convert to string first
      (order.vendor_name && order.vendor_name.toLowerCase().includes(lowerSearch)) // ✅ Ensure vendor_name exists
    );
  });

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <Navbar />
      <Sidebar />

      <main className="ml-[280px] pt-24 px-6">
        <h1 className="text-4xl font-serif font-bold text-gray-800 mb-8">
          Purchase Orders
        </h1>

        {/* Filter Card */}
        <FilterCard vendors={vendors} />

        {/* ✅ SearchBar now updates `searchQuery` */}
        <SearchBar onSearch={setSearchQuery} />

        {/* ✅ Pass the filtered data to TableComponent */}
        <TableComponent 
  title="Purchase Orders" 
  columns={[
    { key: "order_id", label: "Order ID" },
    { key: "vendor_id", label: "Vendor ID" },
    { key: "order_date", label: "Order Date" },
    { key: "total_amount", label: "Total Amount" },
    { key: "balanceDue", label: "Balance Due" },
    { key: "cgst_amount", label: "CGST Amount" },
    { key: "sgst_amount", label: "SGST Amount" },
    { key: "igst_amount", label: "IGST Amount" },
    { key: "status", label: "Status" }
  ]} 
  data={searchFilteredData} 
/>
      </main>
    </div>
  );
};

export default PurchaseOrders;