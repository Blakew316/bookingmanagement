export const EVENT_STATUSES = ['inquiry', 'proposal', 'confirmed', 'completed', 'cancelled'];

export const EVENT_TYPES = ['wedding', 'corporate', 'social', 'birthday', 'gala', 'fundraiser', 'holiday', 'other'];

export const STATUS_COLORS = {
  inquiry: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
  },
  proposal: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  confirmed: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
  },
  completed: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    dot: 'bg-gray-500',
  },
  cancelled: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
  },
};

export const PAYMENT_STATUS_COLORS = {
  unpaid: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
  },
  partial: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  paid: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
  },
};

export const PAYMENT_TYPES = ['deposit', 'partial', 'final'];

export const PAYMENT_METHODS = ['credit_card', 'check', 'cash', 'bank_transfer'];
