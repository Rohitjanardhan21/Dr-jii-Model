import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

function index({ children, title }) {
  return (
    <div className='relative flex flex-col min-h-screen bg-dry'>
      {/* Header */}
      <Header title={title} />

      <div className='flex flex-1'>
        <Sidebar />

        {/* Page Content */}
        <div className='flex-1 overflow-y-auto p-4 sm:p-6'>
          {children}
        </div>
      </div>
    </div>
  );
}

export default index;
