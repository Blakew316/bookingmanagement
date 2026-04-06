import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({ icon: Icon = Inbox, title, message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Icon className="w-8 h-8 text-gray-300 mb-3" />
      <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
      {message && <p className="text-xs text-gray-500 text-center max-w-sm mb-4">{message}</p>}
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
