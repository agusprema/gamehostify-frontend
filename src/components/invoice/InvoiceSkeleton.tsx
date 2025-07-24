// src/components/invoice/InvoiceSkeleton.tsx
export default function InvoiceSkeleton() {
  return (
    <div className="animate-pulse space-y-4 transition-colors duration-300">
      <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded" />
    </div>
  );
}
