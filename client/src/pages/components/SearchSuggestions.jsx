import React from 'react';

export default function SearchSuggestions({ query }) {
  return (
    <div className="absolute top-full left-0 right-0 bg-white border z-50 rounded mt-1">
      <p className="p-2 text-gray-500 text-sm">Suggested queries for '{query}'</p>
    </div>
  );
}