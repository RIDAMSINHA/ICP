// SidebarWithModal.js
import React from 'react';

function SidebarWithModal({ openModal }) {
  return (
    <div className="w-60 h-screen bg-green-50 fixed top-0 left-0 border-r-4 shadow-xl">
      <div className="mt-24">
        <ul className="space-y-4">
          <li onClick={() => openModal("Overview")} className="p-4 shadow-xl hover:bg-green-100 cursor-pointer">Overview</li>
          <li onClick={() => openModal("Energy Usage")} className="p-4 shadow-xl hover:bg-green-100 cursor-pointer">Energy Usage</li>
          <li onClick={() => openModal("Carbon Offset")} className="p-4 shadow-xl hover:bg-green-100 cursor-pointer">Carbon Offset</li>
          <li onClick={() => openModal("Alerts")} className="p-4 shadow-xl hover:bg-green-100 cursor-pointer">Alerts</li>
        </ul>
      </div>
    </div>
  );
}

export default SidebarWithModal;
