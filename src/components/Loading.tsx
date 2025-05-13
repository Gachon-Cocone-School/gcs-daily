"use client";

type LoadingProps = {
  message?: string;
};

export default function Loading({ message }: LoadingProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
        {message && <p className="text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
