"use client";
import React from "react";

type NavItem = { id: string; label: string };
type Props = { items: NavItem[] };

export default function ReportNavigation({ items }: Props) {
  return (
    <div className="panel panel-ultra-slim">
      <div className="panel-header">Rapport</div>
      <nav className="panel-body space-y-1">
        {items.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="nav-item" onClick={(e) => {
            e.preventDefault();
            document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}>
            {s.label}
          </a>
        ))}
      </nav>
    </div>
  );
}


