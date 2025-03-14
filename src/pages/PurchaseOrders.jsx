import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import FilterCard from "../components/FilterCard";
import TableComponent from "../components/TableComponent";
import SearchBar from "../components/SearchBar";
import supabase from "../supabaseClient";

const PurchaseOrders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [rawData, setRawData] = useState({ orders: [], orderItems: [], vendors: [] });

  // ✅ Fetch raw data
  const fetchDetails = async () => {
    try {
      // ✅ Fetch purchase orders
      const { data: orders, error: ordersError } = await supabase.from("purchase_orders").select("*");

      // ✅ Fetch purchase order items (products per order_id)
      const { data: orderItems, error: itemsError } = await supabase.from("purchase_order_item").select(
        "order_id, product_id, product_description, unit_price, quantity, line_total"
      );

      // ✅ Fetch vendors (replace vendor_id with vendor_name & gstin)
      const { data: vendors, error: vendorsError } = await supabase.from("vendors_db").select("vendor_id, vendor_name, gstin");

      if (ordersError) console.error("Error fetching purchase orders:", ordersError);
      if (itemsError) console.error("Error fetching order items:", itemsError);
      if (vendorsError) console.error("Error fetching vendors:", vendorsError);

      setRawData({ orders: orders || [], orderItems: orderItems || [], vendors: vendors || [] });
    } catch (err) {
      console.error("Unexpected error while fetching data:", err);
    }
  };

  // ✅ Process and merge data
  const generateTableData = () => {
    const { orders, orderItems, vendors } = rawData;
  
    // ✅ Create a lookup for vendor_name and gstin
    const vendorMap = {};
    vendors.forEach((vendor) => {
      vendorMap[vendor.vendor_id] = { vendor_name: vendor.vendor_name, gstin: vendor.gstin };
    });
  
    const finalData = [];
  
    // ✅ Iterate through orders and attach products as separate rows
    orders.forEach((order) => {
      const products = orderItems.filter((item) => item.order_id === order.order_id);
  
      if (products.length === 0) {
        // ✅ If no products exist, still add a single row
        finalData.push({
          order_id: order.order_id,
          vendor_name: vendorMap[order.vendor_id]?.vendor_name || "Unknown Vendor",
          gstin: vendorMap[order.vendor_id]?.gstin || "N/A",
          order_date: order.order_date,
          balanceDue: parseFloat(order.total_amount || "0"), // ✅ Show once
          status: "Unsettled",
          product_id: "No Products",
          product_description: "No Products",
          unit_price: "No Products",
          quantity: "No Products",
          total_price: "No Products", // ✅ New column
        });
      } else {
        // ✅ If products exist, add each product as a separate row
        products.forEach((product, index) => {
          finalData.push({
            order_id: index === 0 ? order.order_id : "", // ✅ Show order_id only on first row
            vendor_name: index === 0 ? vendorMap[order.vendor_id]?.vendor_name || "Unknown Vendor" : "",
            gstin: index === 0 ? vendorMap[order.vendor_id]?.gstin || "N/A" : "",
            order_date: index === 0 ? order.order_date : "",
            balanceDue: index === 0 ? parseFloat(order.total_amount || "0") : "", // ✅ Show only in first row
            status: index === 0 ? "Unsettled" : "",
            product_id: product.product_id,
            product_description: product.product_description,
            unit_price: `₹${product.unit_price}`,
            quantity: product.quantity,
            total_price: product.line_total ? `₹${product.line_total}` : "N/A", // ✅ Handle undefined case
          });
        });
      }
    });
  
    return finalData;
  };

  // ✅ Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching purchase details...");
      await fetchDetails(); // Fetch raw data
    };

    fetchData();
  }, []);

  // ✅ Process data when rawData updates
  useEffect(() => {
    if (rawData.orders.length) {
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
      filtered = filtered.filter((item) => item.balanceDue >= parseFloat(minBalance));
    }
    if (maxBalance) {
      filtered = filtered.filter((item) => item.balanceDue <= parseFloat(maxBalance));
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
  const searchFilteredData = filteredData.filter((order) => {
    if (!searchQuery) return true;

    const lowerSearch = searchQuery.toLowerCase();
    return (
      String(order.order_id).toLowerCase().includes(lowerSearch) ||
      (order.vendor_name && order.vendor_name.toLowerCase().includes(lowerSearch))
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

        {/* ✅ Pass filter functions to FilterCard */}
        <FilterCard 
          onApplyFilters={handleApplyFilters} 
          onResetFilters={handleResetFilters} 
        />

        {/* ✅ SearchBar now updates `searchQuery` */}
        <SearchBar onSearch={setSearchQuery} />

        {/* ✅ Pass the filtered & searched data to TableComponent */}
        <TableComponent 
  title="Purchase Orders" 
  columns={[
    { key: "order_id", label: "Order ID" },
    { key: "vendor_name", label: "Vendor Name" },
    { key: "gstin", label: "GSTIN" },
    { key: "order_date", label: "Order Date" },
    { key: "balanceDue", label: "Balance Due" },
    { key: "status", label: "Status" },
    { key: "product_id", label: "Product ID" }, 
    { key: "product_description", label: "Product Description" },
    { key: "unit_price", label: "Unit Price" },
    { key: "quantity", label: "Quantity" },
    { key: "total_price", label: "Total Price" }, // ✅ New column
  ]} 
  data={searchFilteredData} 
/>
      </main>
    </div>
  );
};

export default PurchaseOrders;