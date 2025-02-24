import React from 'react';
import { FileText } from 'lucide-react';

const DataTable = ({ 
  data = [], 
  columns = [], 
  onPdfClick,
  title = "Data Table" 
}) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="mt-8 bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                  <td 
                    key={colIndex} 
                    className="px-6 py-4 whitespace-nowrap text-sm"
                  >
                    {column.key === 'status' ? (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(row[column.key])}`}>
                        {row[column.key]}
                      </span>
                    ) : column.key === 'pdfUrl' ? (
                      <button
                        onClick={() => onPdfClick?.(row[column.key])}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors duration-200 p-2 rounded-full hover:bg-blue-50"
                        title="View PDF"
                      >
                        <FileText className="h-5 w-5" />
                      </button>
                    ) : column.key === 'balanceDue' ? (
                      <span>₹{parseFloat(row[column.key]).toLocaleString('en-IN')}</span>
                    ) : (
                      row[column.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;