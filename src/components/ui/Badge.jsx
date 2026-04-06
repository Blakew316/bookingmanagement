import { STATUS_COLORS, PAYMENT_STATUS_COLORS } from '../../lib/constants';

export default function Badge({ status, type = 'event', children, className = '' }) {
  const colors = type === 'payment' ? PAYMENT_STATUS_COLORS : STATUS_COLORS;
  const color = colors[status] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${color.bg} ${color.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
      {children || status?.replace('_', ' ')}
    </span>
  );
}
