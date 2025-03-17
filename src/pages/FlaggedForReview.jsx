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
  const [userLevel, setUserLevel] = useState(null);

  // Fetch logged-in user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      
      const { id } = JSON.parse(storedUser);

      const { data, error } = await supabase
        .from("users")
        .select("level")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching user level:", error);
      } else {
        setUserLevel(data.level);
      }
    };

    fetchUserDetails();
  }, []);

  // Fetch flagged invoices data + vendor details
  const fetchDetails = async () => {
    try {
      const { data: flaggedInvoices, error: flaggedError } = await supabase
        .from("flagged")
        .select("order_id, invoice_id, vendor_id, invoice_date, reason, Invoices_pdf, Report_pdfs, status, level");

      const { data: vendors, error: vendorsError } = await supabase
        .from("vendors_db")
        .select("vendor_id, vendor_name");

      if (flaggedError) console.error("Error fetching flagged invoices:", flaggedError);
      if (vendorsError) console.error("Error fetching vendors:", vendorsError);

      const vendorMap = {};
      vendors?.forEach((vendor) => {
        vendorMap[vendor.vendor_id] = vendor.vendor_name;
      });

      let mergedData = flaggedInvoices?.map((invoice) => ({
        ...invoice,
        vendor_name: vendorMap[invoice.vendor_id] || "Unknown Vendor",
      }));

      mergedData = mergedData?.filter((invoice) => invoice.status !== "Rejected");

      setTableData(mergedData || []);
      setFilteredData(mergedData || []);
    } catch (err) {
      console.error("Unexpected error while fetching data:", err);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  // Handle Approve action
  const handleApprove = (orderId) => {
    if (userLevel === null) {
      alert("User level is not yet loaded.");
      return;
    }
    alert(`Invoice ${orderId} approved.`);
  };

  // Handle Deny action
  const handleDeny = async (invoice) => {
    if (userLevel === null) {
      alert("User level is not yet loaded.");
      return;
    }
    try {
      const { error: rejectError } = await supabase.from("Rejected").insert([
        {
          order_id: invoice.order_id,
          invoice_id: invoice.invoice_id,
          vendor_id: invoice.vendor_id,
          Reason: invoice.reason,
          pdf_url: invoice.Invoices_pdf,
          invoice_date: invoice.invoice_date,
          total:invoice.total,
        },
      ]);

      if (rejectError) {
        console.error("Error moving to rejected table:", rejectError);
        alert("Error rejecting invoice: " + JSON.stringify(rejectError, null, 2));
        return;
      }

      const { error: updateError } = await supabase
        .from("flagged")
        .update({ status: "Rejected" })
        .eq("order_id", invoice.order_id);

      if (updateError) {
        console.error("Error updating status in flagged table:", updateError);
        alert("Error updating invoice status: " + JSON.stringify(updateError, null, 2));
        return;
      }

      fetchDetails();
    } catch (err) {
      console.error("Unexpected error while denying invoice:", err);
      alert("Unexpected error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <Navbar />
      <Sidebar />

      <main className="ml-[280px] pt-24 px-6">
        <h1 className="text-4xl font-serif font-bold text-gray-800 mb-8">
          Flagged for Review
        </h1>

        <FilterCard
          onApplyFilters={({ startDate, endDate }) => {
            let filtered = [...tableData];
            if (startDate && endDate) {
              filtered = filtered.filter((item) => {
                const itemDate = new Date(item.invoice_date);
                return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
              });
            }
            setFilteredData(filtered);
          }}
          onResetFilters={() => setFilteredData(tableData)}
          tableData={filteredData}
        />

        <SearchBar onSearch={setSearchQuery} />

        <TableComponent
          title="Flagged Invoices"
          columns={[
            { key: "order_id", label: "Order ID" },
            { key: "invoice_id", label: "Invoice ID" },
            { key: "vendor_name", label: "Vendor Name" },
            { key: "invoice_date", label: "Invoice Date" },
            { key: "reason", label: "Reason" },
            { key: "Invoices_pdf", label: "Invoice PDF" },
            { key: "Report_pdfs", label: "Report PDFs" },
            {
              key: "approval",
              label: "Approval",
              render: (row) => (
                <div className="flex flex-col">
                  {userLevel !== null && row.level !== undefined ? (
                    userLevel >= row.level ? (
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleApprove(row.invoice_id)}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDeny(row)}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <p className="text-red-600 font-semibold">
                        You do not have the authority for approval of the invoice.
                      </p>
                    )
                  ) : (
                    <p className="text-gray-500">Loading...</p>
                  )}
                </div>
              ),
            },
          ]}
          data={filteredData.filter((invoice) => {
            if (!searchQuery) return true;
            const lowerSearch = searchQuery.toLowerCase();
            return (
              String(invoice.order_id).toLowerCase().includes(lowerSearch) ||
              String(invoice.invoice_id).toLowerCase().includes(lowerSearch) ||
              (invoice.vendor_name && invoice.vendor_name.toLowerCase().includes(lowerSearch))
            );
          })}
        />
      </main>
    </div>
  );
};

export default FlaggedForReview;