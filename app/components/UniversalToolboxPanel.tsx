"use client";
import React from "react";

type ToolItem = { icon?: React.ReactNode; title: string; subtitle?: string };
type Props = { items: ToolItem[] };

export default function UniversalToolboxPanel({ items }: Props) {
  return (
    <div className="panel panel-slim">
      <div className="panel-header">Verktyg & Bilagor</div>
      <div className="panel-body">
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="tool-item">
              <div className="tool-icon" aria-hidden>{it.icon ?? "📄"}</div>
              <div className="tool-text">
                <div className="tool-title">{it.title}</div>
                {it.subtitle && <div className="tool-subtitle">{it.subtitle}</div>}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="panel-footer">
        <div className="text-[11px] opacity-60">Powered by Recta</div>
      </div>
    </div>
  );
}


