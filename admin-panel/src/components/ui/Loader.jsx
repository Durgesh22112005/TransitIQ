import { Loader2, Inbox } from 'lucide-react';

export function Loader({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function EmptyState({ icon, message = 'No data found.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
      {icon || <Inbox className="w-12 h-12" />}
      <p className="text-sm">{message}</p>
      {action}
    </div>
  );
}
