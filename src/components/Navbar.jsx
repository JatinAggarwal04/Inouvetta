import React from "react";
import { FaBell, FaSearch } from "react-icons/fa";
// Import the image
import logo from "/IMG_1248.png"; 

const Navbar = () => {
  return (
    <div className="fixed top-4 left-[290px] right-4 bg-white shadow-lg rounded-lg p-4 h-16 flex justify-between items-center z-20">
      
      <div className="flex items-center space-x-4">
        <img 
          src={logo} 
          alt="Logo" 
          className="h-20 w-auto" 
        />
      </div>
      
      <div className="flex items-center space-x-6">
        
        <select className="border border-gray-200 rounded-md px-3 py-1.5 outline-none">
          <option>English</option>
        </select>
        
        <div className="relative cursor-pointer">
          <FaBell size={20} className="text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </div>
        
        <FaSearch size={20} className="text-gray-600 cursor-pointer" />
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">JA</span>
          </div>
          <span className="text-sm font-medium">Jatin Aggarwal</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;