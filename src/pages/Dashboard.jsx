import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FileText } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  const [chartData, setChartData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showRangeWarning, setShowRangeWarning] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  // Sample PDF URLs
  const pdfFiles = [
    "invoice_Aaron Hawkins_6817.pdf",
    "invoice_Aimee Bixby_39797.pdf",
    "invoice_Angele Hood_35601.pdf",
    "invoice_Bill Donatelli_11631.pdf",
  ];

  const generateInvoiceId = () =>
    `INV-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;

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

  const generateTableData = (count, type) => {
    return Array(count)
      .fill(null)
      .map(() => {
        const baseData = {
          invoiceId: generateInvoiceId(),
          vendorName: vendors[Math.floor(Math.random() * vendors.length)],
          timeReceived: new Date(
            new Date().getTime() - Math.random() * 86400000
          ).toLocaleTimeString(),
          emailId: `${vendors[Math.floor(Math.random() * vendors.length)]
            .toLowerCase()
            .replace(/\s+/g, ".")}@gmail.com`,
          pdfUrl: pdfFiles[Math.floor(Math.random() * pdfFiles.length)],
        };

        if (type === "received") {
          return {
            ...baseData,
            balanceDue: (Math.random() * 1000000).toFixed(2), 
            status: Math.random() > 0.3 ? "Verified" : "Flagged for Review",
          };
        } else if (type === "verified") {
          return {
            ...baseData,
            balanceDue: (Math.random() * 1000000).toFixed(2),
          };
        } else {
          return {
            ...baseData,
            status: Math.random() > 0.5 ? "Verified" : "Rejected",
          };
        }
      });
};

  const generateData = () => {
    const data = [];
    const today = new Date();
    for (let i = 9; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const received = Math.floor(Math.random() * 51);
      const minVerified = Math.ceil(received * 0.5);
      const maxVerified = received;
      const verified =
        Math.floor(Math.random() * (maxVerified - minVerified + 1)) +
        minVerified;
      const unverified = received - verified;
      data.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        received,
        verified,
        unverified,
        receivedData: generateTableData(received, "received"),
        verifiedData: generateTableData(verified, "verified"),
        unverifiedData: generateTableData(unverified, "flagged"),
      });
    }
    return data;
  };

  const calculateDateDifference = (start, end) => {
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleApplyFilters = () => {
    if (startDate && endDate) {
      if (calculateDateDifference(startDate, endDate) < 10) {
        alert("Date range should be at least 10 days");
        return;
      }

      if (calculateDateDifference(startDate, endDate) > 10) {
        setShowRangeWarning(true);
        return;
      }
    }

    applyFilters();
  };

  const applyFilters = () => {
    let filtered = [...chartData];

    filtered = filtered.map((day) => {
      // Filter receivedData
      let filteredReceived = [...day.receivedData];
      let filteredVerified = [...day.verifiedData];
      let filteredUnverified = [...day.unverifiedData];

      // Apply vendor filter
      if (selectedVendor) {
        filteredReceived = filteredReceived.filter(
          (item) => item.vendorName === selectedVendor
        );
        filteredVerified = filteredVerified.filter(
          (item) => item.vendorName === selectedVendor
        );
        filteredUnverified = filteredUnverified.filter(
          (item) => item.vendorName === selectedVendor
        );
      }

      
      if (balanceAmount) {
       
        filteredReceived = filteredReceived.filter(
          (item) =>
            parseFloat(item.balanceDue.replace("$", "")) <=
            parseFloat(balanceAmount)
        );
        filteredVerified = filteredVerified.filter(
          (item) =>
            parseFloat(item.balanceDue.replace("$", "")) <=
            parseFloat(balanceAmount)
        );
      }

      return {
        ...day,
        receivedData: filteredReceived,
        verifiedData: filteredVerified,
        unverifiedData: filteredUnverified,
        received: filteredReceived.length,
        verified: filteredVerified.length,
        unverified: filteredUnverified.length,
      };
    });

    // Apply date filter after processing the data
    if (startDate && endDate) {
      filtered = filtered.filter((day) => {
        const currentDate = new Date(
          day.date + ", " + new Date().getFullYear()
        );
        return (
          currentDate >= new Date(startDate) && currentDate <= new Date(endDate)
        );
      });
    }

    setFilteredData(filtered);
  };

  const handleResetFilters = () => {
    setSelectedVendor("");
    setBalanceAmount("");
    setStartDate("");
    setEndDate("");
    setFilteredData([]);
    setShowRangeWarning(false);
  };

  useEffect(() => {
    const data = generateData();
    setChartData(data);

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 10);

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  }, []);

  const handleBarClick = (data, type) => {
    setSelectedDate(data.date);
    setSelectedTable(type);
  };

  const RangeWarningModal = ({ onContinue, onCancel }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Date Range Warning</h3>
        <p className="mb-6">
          Since the date range is greater than 10 days, we will provide you with
          an Excel sheet. Would you like to continue?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onContinue}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );

  const FilterCard = () => (
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
            {/* Custom Dropdown Arrow Icon */}
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
            Balance Amount
          </label>
          <input
            type="number"
            value={balanceAmount}
            onChange={(e) => setBalanceAmount(e.target.value)}
            placeholder="Enter amount (Min balance: ₹100)"
            className="w-full rounded-md border border-gray-300 p-2"
            min="100" // Minimum balance value
            step="20" // Allowing decimal values for flexibility
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-4">
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer transition-all ease-in-out"
        >
          Reset Filters
        </button>
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer transition-all ease-in-out"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  const PdfPreviewModal = ({ pdfUrl, onClose }) => {
    return (
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
            <object
              data={pdfUrl}
              type="application/pdf"
              className="w-full h-full"
            >
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
  };

  const TableComponent = ({ type, data }) => {
    const [sortConfig, setSortConfig] = useState({
      key: null,
      direction: "ascending",
    });

    const sortedData = React.useMemo(() => {
      if (!sortConfig.key) return data;

      return [...data].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }, [data, sortConfig]);

    const requestSort = (key) => {
      if (["invoiceId", "status", "pdfUrl"].includes(key)) return;

      let direction = "ascending";
      if (sortConfig.key === key && sortConfig.direction === "ascending") {
        direction = "descending";
      }
      setSortConfig({ key, direction });
    };

    const columns = {
      received: [
        "Invoice ID",
        "Vendor Name",
        "Balance Due",
        "Time Received",
        "Status",
        "Email ID",
        "Invoice",
      ],
      verified: [
        "Invoice ID",
        "Vendor Name",
        "Balance Due",
        "Time Received",
        "Email ID", 
        "Invoice",
      ],
      flagged: [
        "Invoice ID",
        "Vendor Name",
        "Time Received",
        "Status",
        "Email ID",
        "Invoice",
      ],
    };

    return (
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {type === "received"
            ? "Received Invoices"
            : type === "verified"
            ? "Verified Invoices"
            : "Flagged Invoices"}{" "}
          - {selectedDate}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                {columns[type].map((column, index) => (
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
                  {type !== "flagged" && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{row.balanceDue.toLocaleString("en-IN")}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.timeReceived}
                  </td>
                  {(type === "received" || type === "flagged") && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          row.status === "Verified"
                            ? "bg-green-100 text-green-800"
                            : row.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.emailId}
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
                      className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors duration-200 p-2 rounded-full hover:bg-blue-50"
                      title="View PDF"
                    >
                      <FileText className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const CardHeader = ({ title }) => (
    <div className="mb-6">
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm p-4 shadow-lg rounded-lg border">
          <p className="font-semibold border-b pb-2 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="flex items-center gap-2 py-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></span>
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
      <div className="ml-[280px] pt-24 px-6">
        <h1 className="text-4xl font-serif font-bold text-gray-800 mb-8">
          Dashboard
        </h1>

        <FilterCard />

        {showRangeWarning && (
          <RangeWarningModal
            onContinue={() => {
              setShowRangeWarning(false);
              applyFilters();
            }}
            onCancel={() => {
              setShowRangeWarning(false);
            }}
          />
        )}

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <CardHeader title="Invoices Received" />
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData.length ? filteredData : chartData}
                  onClick={(data) =>
                    handleBarClick(data.activePayload[0].payload, "received")
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#666" }}
                    tickLine={{ stroke: "#666" }}
                  />
                  <YAxis
                    tickCount={6}
                    domain={[0, 50]}
                    tick={{ fill: "#666" }}
                    tickLine={{ stroke: "#666" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    name="Invoices"
                    dataKey="received"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                    {...chartProps}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <CardHeader title="Invoices Verified" />
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData.length ? filteredData : chartData}
                  onClick={(data) =>
                    handleBarClick(data.activePayload[0].payload, "verified")
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#666" }}
                    tickLine={{ stroke: "#666" }}
                  />
                  <YAxis
                    tickCount={6}
                    domain={[0, 50]}
                    tick={{ fill: "#666" }}
                    tickLine={{ stroke: "#666" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    name="Invoices"
                    dataKey="verified"
                    fill="#16a34a"
                    radius={[4, 4, 0, 0]}
                    {...chartProps}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <CardHeader title="Invoices Unverified" />
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData.length ? filteredData : chartData}
                  onClick={(data) =>
                    handleBarClick(data.activePayload[0].payload, "flagged")
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#666" }}
                    tickLine={{ stroke: "#666" }}
                  />
                  <YAxis
                    tickCount={6}
                    domain={[0, 50]}
                    tick={{ fill: "#666" }}
                    tickLine={{ stroke: "#666" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    name="Invoices"
                    dataKey="unverified"
                    fill="#dc2626"
                    radius={[4, 4, 0, 0]}
                    {...chartProps}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        
        {selectedDate && selectedTable && (
          <TableComponent
            type={selectedTable}
            data={
              selectedTable === "received"
                ? (filteredData.length ? filteredData : chartData).find(
                    (d) => d.date === selectedDate
                  ).receivedData
                : selectedTable === "verified"
                ? (filteredData.length ? filteredData : chartData).find(
                    (d) => d.date === selectedDate
                  ).verifiedData
                : (filteredData.length ? filteredData : chartData).find(
                    (d) => d.date === selectedDate
                  ).unverifiedData
            }
          />
        )}

       
        {showPdfPreview && (
          <PdfPreviewModal
            pdfUrl={selectedPdf}
            onClose={() => {
              setShowPdfPreview(false);
              setSelectedPdf(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
