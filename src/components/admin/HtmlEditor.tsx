"use client";

import dynamic from "next/dynamic";

const CkContentEditor = dynamic(() => import("@/components/admin/CkContentEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-80 flex-1 items-center justify-center text-sm text-muted">
      Loading editor…
    </div>
  ),
});

export function HtmlEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  return <CkContentEditor value={value} onChange={onChange} />;
}
