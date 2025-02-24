import React, { useState, useEffect } from 'react';

const FilterCard = ({ onApplyFilters, onResetFilters }) => {
  const [minBalance, setMinBalance] = useState('');
  const [maxBalance, setMaxBalance] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showRangeWarning, setShowRangeWarning] = useState(false);

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 9);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const calculateDateDifference = (start, end) => {
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleBalanceChange = (type, value) => {
    if (type === 'min') {
      setMinBalance(value);
    } else {
      // Only validate max balance if min balance exists and max balance is not empty
      if (!minBalance || value === '' || parseFloat(value) >= parseFloat(minBalance)) {
        setMaxBalance(value);
      }
    }
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (endDate && new Date(endDate) < new Date(date)) {
      setEndDate(date);
    }
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

    onApplyFilters({
      minBalance,
      maxBalance,
      startDate,
      endDate
    });
  };

  const handleResetFilters = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 9);

    setMinBalance('');
    setMaxBalance('');
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setShowRangeWarning(false);
    onResetFilters();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Filter Options</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Balance
          </label>
          <input
            type="number"
            value={minBalance}
            onChange={(e) => handleBalanceChange('min', e.target.value)}
            placeholder="Enter min amount (₹)"
            className="w-full rounded-md border border-gray-300 p-2"
            min="0"
            step="100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Balance
          </label>
          <input
            type="number"
            value={maxBalance}
            onChange={(e) => handleBalanceChange('max', e.target.value)}
            placeholder="Enter max amount (₹)"
            className="w-full rounded-md border border-gray-300 p-2"
            min="0"
            step="100"
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
            onChange={(e) => handleStartDateChange(e.target.value)}
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
            min={startDate}
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

      {showRangeWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Date Range Warning</h3>
            <p className="mb-6">
              Since the date range is greater than 10 days, we will provide you with
              an Excel sheet. Would you like to continue?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowRangeWarning(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRangeWarning(false);
                  onApplyFilters({
                    minBalance,
                    maxBalance,
                    startDate,
                    endDate
                  });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterCard;