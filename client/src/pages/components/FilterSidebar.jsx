import React from 'react';

export default function FilterSidebar({ onFilter }) {
  return (
    <div className="w-64 p-4 border rounded bg-white dark:bg-black">
      <h3 className="font-bold border-b pb-2 mb-4">Filters</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold">Price Range</label>
          <input type="range" min="0" max="1000" className="w-full" />
        </div>
      </div>
    </div>
  );
}