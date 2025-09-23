"use client";
import React from "react";
import SimpleArena from "../components/SimpleArena";
import ErrorBoundary, { ArenaErrorFallback } from "../components/ErrorBoundary";

export default function Arena() {
  return (
    <ErrorBoundary fallback={ArenaErrorFallback}>
      <SimpleArena />
    </ErrorBoundary>
  );
}
