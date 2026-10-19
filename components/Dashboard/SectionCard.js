import { Children } from "react";

import { InlineLoader } from "@/components/Loader";

export default function SectionCard({
  title,
  action,
  loading = false,
  loadingLabel,
  emptyText = "Nothing to show yet.",
  children,
}) {
  // toArray drops null / false / undefined, so empty lists count as empty
  const hasContent = Children.toArray(children).length > 0;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl text-slate-900">{title}</h2>
        {action}
      </div>
      <div className="mt-5">
        {loading ? (
          <InlineLoader label={loadingLabel} />
        ) : hasContent ? (
          children
        ) : (
          <p className="text-slate-600">{emptyText}</p>
        )}
      </div>
    </section>
  );
}