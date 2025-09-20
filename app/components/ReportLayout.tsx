"use client";
import React from "react";

type ReportLayoutProps = {
  left?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
};

export default function ReportLayout({ left, right, children }: ReportLayoutProps) {
  return (
    <div className="app-frame">
      {/* Left toolbox - fixed and vertically centered */}
      <aside className="panel-ghost fixed-panel fixed-left hidden lg:block" aria-label="Verktygslåda">
        {left}
      </aside>

      {/* Center document */}
      <div className="document-column">
        <div className="document-focus">
          {children}
        </div>
      </div>

      {/* Right navigation - fixed and vertically centered */}
      <aside className="panel-ghost fixed-panel fixed-right hidden lg:block" aria-label="Navigering">
        {right}
      </aside>
    </div>
  );
}


