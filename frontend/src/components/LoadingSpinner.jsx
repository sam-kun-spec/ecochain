import React from "react";

export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-slate-600">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand-500" />
      <span>{label}</span>
    </div>
  );
}

