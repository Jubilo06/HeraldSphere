import React from 'react';

const LegalLayout = ({ title, lastUpdated, children }) => (
  <div className="bg-white min-h-screen pt-32 pb-20 px-6">
    <div className="max-w-3xl mx-auto">
      {/* Title with Herald Sphere styling */}
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">
        {title}
      </h1>
      <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-12">
        Last Updated: {lastUpdated || 'May 2024'}
      </p>
      
      {/* Content area with built-in Tailwind Typography styling */}
      <div className="prose prose-slate prose-indigo prose-lg leading-relaxed text-slate-600 max-w-none">
        {children}
      </div>
    </div>
  </div>
);

export default LegalLayout;