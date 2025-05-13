import { memo } from "react";

type LoadingProps = {
  message?: string;
};

const Loading = memo(function Loading({ message }: LoadingProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
        {message && <p className="text-gray-600">{message}</p>}
      </div>
    </div>
  );
});

export default Loading;
