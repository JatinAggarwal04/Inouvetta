import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const FlaggedForReview = () => {
  const [tableData, setTableData] = useState([]);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [showNoFlaggedAlert, setShowNoFlaggedAlert] = useState(false);

  const flaggedPdfFiles = [
    "/Flagged-1.pdf",
    "Flagged-2.pdf",
    "/Flagged-3.pdf",
    "/Flagged-4.pdf",
  ];

  const purchaseOrderPdfFiles = [
    "/invoice_Aaron Hawkins_6817.pdf",
    "invoice_Aimee Bixby_39797.pdf",
    "/invoice_Angele Hood_35601.pdf",
    "/invoice_Bill Donatelli_11631.pdf",
  ];

  const generateInvoiceId = () => `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

  const vendors = [
    "Tech Solutions Inc.",
    "Global Services Ltd.",
    "Digital Systems Co.",
    "Smart Electronics",
    "Future Technologies",
    "Innovation Corp",
    "Data Systems LLC",
    "Cloud Solutions Pro",
    "Network Solutions",
    "Software Dynamics",
  ];

  const reasons = ["Missing Details", "Mismatch with PO"];

  const generateTableData = (count, filters = {}) => {
    const { vendor, maxPayment, startDate, endDate } = filters;
    return Array(count)
      .fill(null)
      .map(() => {
        let date;
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        } else {
          date = new Date(new Date().getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        }
        const vendorName = vendor || vendors[Math.floor(Math.random() * vendors.length)];
        const payment = maxPayment ? Math.random() * Math.min(maxPayment, 1000000) : Math.random() * 1000000;
        return {
          invoiceId: generateInvoiceId(),
          vendorName,
          payment: `${payment.toFixed(2)}`,
          timeReceived: date.toLocaleTimeString(),
          date: date.toLocaleDateString(),
          emailId: `${vendorName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
          pdfUrl: flaggedPdfFiles[Math.floor(Math.random() * flaggedPdfFiles.length)],
          purchaseOrderPdfUrl: purchaseOrderPdfFiles[Math.floor(Math.random() * purchaseOrderPdfFiles.length)],
          reason: reasons[Math.floor(Math.random() * reasons.length)],
        };
      });
  };

  const handleApplyFilters = () => {
    const today = new Date().toISOString().split("T")[0];
    if (endDate > today) {
      alert("End date cannot be greater than today's date.");
      return;
    }

    const filters = {
      vendor: selectedVendor,
      maxPayment: paymentAmount ? parseFloat(paymentAmount) : null,
      startDate,
      endDate,
    };

    
    const newData = generateTableData(20, filters);
    setTableData(newData);

    let filtered = [...newData];
    if (selectedVendor) {
      filtered = filtered.filter((item) => item.vendorName === selectedVendor);
    }
    if (paymentAmount) {
      filtered = filtered.filter(
        (item) => parseFloat(item.payment.replace("$", "")) <= parseFloat(paymentAmount)
      );
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 20) {
        setShowAlert(true);
      }
      
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= start && itemDate <= end;
      });

      const lastThreeDays = new Date();
      lastThreeDays.setDate(lastThreeDays.getDate() - 3);
      if (end < lastThreeDays) {
        setShowNoFlaggedAlert(true);
      }
    }
    setFilteredData(filtered);
  };

  const handleResetFilters = () => {
    setSelectedVendor("");
    setPaymentAmount("");
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 3);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    setFilteredData([]);
  };

  const handleDelete = (invoiceId) => {
    const newData = tableData.filter(item => item.invoiceId !== invoiceId);
    setTableData(newData);
    setFilteredData(filteredData.filter(item => item.invoiceId !== invoiceId));
  };

  const handleApprove = (invoiceId) => {
    alert(`Approved: ${invoiceId}`);
    handleDelete(invoiceId);
  };

  const handleDeny = (invoiceId) => {
    alert(`Denied: ${invoiceId}`);
    handleDelete(invoiceId);
  };
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    const today = new Date().toISOString().split("T")[0]; 
  
    
    if (newStartDate > today) {
      alert("Start date cannot be after today's date.");
      return;
    }
  
    setStartDate(newStartDate);
  
    
    if (newStartDate > endDate) {
      setEndDate(newStartDate);
    }
  };
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    const today = new Date().toISOString().split("T")[0]; 
  
    
    if (newEndDate > today) {
      alert("End date cannot be after today's date.");
      return;
    }
  
    
    if (newEndDate < startDate) {
      alert("End date cannot be earlier than the start date.");
      return;
    }
  
    setEndDate(newEndDate);
  };

  const FilterCard = () => {
    const today = new Date().toISOString().split("T")[0];
  
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filter Options</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor
            </label>
            <div className="relative">
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full bg-white text-gray-700 rounded-md p-2 pl-4 pr-10 shadow-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all appearance-none"
              >
                <option value="">All Vendors</option>
                {vendors.map((vendor, index) => (
                  <option key={index} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
              <div className="absolute top-0 right-0 p-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount
            </label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter amount (Min Payment: ₹100)"
              className="w-full rounded-md border border-gray-300 p-2"
              min="100"
              step="20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              max={today} 
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              max={today} 
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-4">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
          >
            Reset Filters
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    );
  };

  const PdfPreviewModal = ({ pdfUrl, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">PDF Preview</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.open(pdfUrl, "_blank")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
            >
              Download
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <object data={pdfUrl} type="application/pdf" className="w-full h-full">
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                pdfUrl
              )}&embedded=true`}
              className="w-full h-full"
              title="PDF Preview"
            />
          </object>
        </div>
      </div>
    </div>
  );

  const AlertModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Alert</h2>
        <p className="text-gray-700 mb-6">
          Since the date range is greater than 20 days, we will be providing you
          with the Excel sheet.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              setShowAlert(false);
              handleResetFilters();
            }}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              setShowAlert(false);
              handleResetFilters();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );

  const NoFlaggedAlertModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Alert</h2>
        <p className="text-gray-700 mb-6">
          No flagged invoices found for the selected date range.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              setShowNoFlaggedAlert(false);
              handleResetFilters();
            }}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const TableComponent = ({ data }) => {
    const [sortConfig, setSortConfig] = useState({
      key: "date",
      direction: "descending",
    });
  
    const sortedData = React.useMemo(() => {
      if (!sortConfig.key) return data;
      return [...data].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.timeReceived}`);
        const dateB = new Date(`${b.date} ${b.timeReceived}`);
        if (dateA < dateB) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (dateA > dateB) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }, [data, sortConfig]);
  
    const requestSort = (key) => {
      let direction = "ascending";
      if (sortConfig.key === key && sortConfig.direction === "ascending") {
        direction = "descending";
      }
      setSortConfig({ key, direction });
    };
  
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                {[
                  "Invoice ID",
                  "Vendor Name",
                  "Payment",
                  "Time Received",
                  "Date",
                  "Email ID",
                  "Reason",
                  "Review Invoice",
                  "Purchase Order", 
                  "Approval",
                ].map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() =>
                      requestSort(column.toLowerCase().replace(/\s+/g, ""))
                    }
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.invoiceId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.vendorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{row.payment.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.timeReceived}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.emailId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => {
                        const absolutePdfUrl = row.pdfUrl.startsWith("http")
                          ? row.pdfUrl
                          : `${window.location.origin}${
                              row.pdfUrl.startsWith("/") ? "" : "/"
                            }${row.pdfUrl}`;
                        setSelectedPdf(absolutePdfUrl);
                        setShowPdfPreview(true);
                      }}
                      className="text-red-600 hover:text-red-800 cursor-pointer transition-colors duration-200 p-2 rounded-full hover:bg-red-50"
                      title="View PDF"
                    >
                      <FileText className="h-5 w-5" />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => {
                        const absolutePdfUrl = row.purchaseOrderPdfUrl.startsWith("http")
                          ? row.purchaseOrderPdfUrl
                          : `${window.location.origin}${
                              row.purchaseOrderPdfUrl.startsWith("/") ? "" : "/"
                            }${row.purchaseOrderPdfUrl}`;
                        setSelectedPdf(absolutePdfUrl);
                        setShowPdfPreview(true);
                      }}
                      className="text-green-600 hover:text-green-800 cursor-pointer transition-colors duration-200 p-2 rounded-full hover:bg-green-50"
                      title="View PDF"
                    >
                      <FileText className="h-5 w-5" />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(row.invoiceId)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDeny(row.invoiceId)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                      >
                        Deny
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const data = generateTableData(20);
    setTableData(data);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 3);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <Navbar />
      <Sidebar />
      <div className="ml-[280px] pt-24 px-6">
        <h1 className="text-4xl font-serif font-bold text-gray-800 mb-8">
          Flagged For Review
        </h1>
        <FilterCard />
        <TableComponent data={filteredData.length ? filteredData : tableData} />
        {showPdfPreview && (
          <PdfPreviewModal
            pdfUrl={selectedPdf}
            onClose={() => {
              setShowPdfPreview(false);
              setSelectedPdf(null);
            }}
          />
        )}
        {showAlert && <AlertModal />}
        {showNoFlaggedAlert && <NoFlaggedAlertModal />}
      </div>
    </div>
  );
};

export default FlaggedForReview;