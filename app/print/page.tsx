"use client";
import React, { useEffect } from "react";
import ReportContent from "../components/ReportContent";

export default function PrintPage() {
  useEffect(() => {
    // Auto-trigger print dialog when page loads
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print-layout">
      <ReportContent />
    </div>
  );
}
