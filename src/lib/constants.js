export const EVENT_STATUSES = ['inquiry', 'proposal', 'confirmed', 'completed', 'cancelled'];

export const EVENT_TYPES = ['wedding', 'corporate', 'social', 'birthday', 'gala', 'fundraiser', 'holiday', 'other'];

export const STATUS_COLORS = {
  inquiry: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
  proposal: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  confirmed: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  completed: {
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    dot: 'bg-gray-300',
  },
  cancelled: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-400',
  },
};

export const PAYMENT_STATUS_COLORS = {
  unpaid: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-400',
  },
  partial: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  paid: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  none: {
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    dot: 'bg-gray-300',
  },
};

export const PAYMENT_TYPES = ['deposit', 'partial', 'final'];

export const PAYMENT_METHODS = ['credit_card', 'check', 'cash', 'bank_transfer'];
