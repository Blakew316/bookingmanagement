import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';

import Card, { CardHeader } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { useApi } from '../hooks/useApi';
import { formatCurrency, formatDate, capitalize } from '../lib/formatters';
import { PAYMENT_STATUS_COLORS, PAYMENT_TYPES, PAYMENT_METHODS } from '../lib/constants';

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'deposit', label: 'Deposits' },
  { key: 'partial', label: 'Partial Payments' },
  { key: 'final', label: 'Final Payments' },
];

function getProgressColor() {
  return 'bg-gray-900';
}

function getProgressTrack() {
  return 'bg-gray-200';
}

export default function Payments() {
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: summary, loading: summaryLoading } = useApi('/payments/summary');
  const { data: payments, loading: paymentsLoading } = useApi('/payments');
  const { data: outstandingEvents, loading: outstandingLoading } = useApi('/events?payment_status=outstanding');

  const filteredPayments = (payments || []).filter((payment) => {
    if (activeFilter === 'all') return true;
    return payment.payment_type === activeFilter;
  });

  if (summaryLoading && paymentsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-1">Track revenue, deposits, and outstanding balances.</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(summary?.total_revenue || 0)}
          sub="All collected payments"
        />
        <StatCard
          icon={Clock}
          label="Outstanding Balance"
          value={formatCurrency(summary?.total_outstanding || 0)}
          sub="Pending collection"
        />
        <StatCard
          icon={CreditCard}
          label="Total Deposits"
          value={formatCurrency(summary?.total_deposits || 0)}
          sub="Secured deposits"
        />
      </div>

      {/* Payments Table Section */}
      <Card className="animate-fade-in" padding={false}>
        <div className="p-6 pb-0">
          <CardHeader
            title="Payment History"
            subtitle="All recorded transactions"
            action={
              <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>{filteredPayments.length} payments</span>
              </div>
            }
          />
        </div>

        {/* Filter Tabs */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeFilter === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {paymentsLoading ? (
          <div className="flex items-center justify-center h-48">
            <LoadingSpinner />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={DollarSign}
              title="No payments found"
              message="No payments match the selected filter."
            />
          </div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="w-full">
              <thead>
                <tr className="border-t border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Event
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Contact
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Amount
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Type
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Method
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, index) => (
                  <tr
                    key={payment.id}
                    className={`border-t border-gray-50 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/events/${payment.event_id}`}
                        className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors inline-flex items-center gap-1 group"
                      >
                        {payment.event_title}
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.contact_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(payment.amount || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {capitalize(payment.payment_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {capitalize((payment.payment_method || '').replace(/_/g, ' '))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 max-w-[200px] truncate">
                      {payment.notes || '\u2014'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Outstanding Events Section */}
      <div className="animate-fade-in">
        <Card padding={false}>
          <div className="p-6 pb-4">
            <CardHeader
              title="Outstanding Balances"
              subtitle="Events with remaining payments due"
              action={
                <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>{(outstandingEvents || []).length} events</span>
                </div>
              }
            />
          </div>

          {outstandingLoading ? (
            <div className="flex items-center justify-center h-48">
              <LoadingSpinner />
            </div>
          ) : !outstandingEvents || outstandingEvents.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CheckCircle2}
                title="All caught up!"
                message="No events with outstanding balances."
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {outstandingEvents.map((event) => {
                const total = event.total_amount || 0;
                const paid = event.total_paid || 0;
                const remaining = total - paid;
                const percentage = total > 0 ? Math.round((paid / total) * 100) : 0;

                return (
                  <div
                    key={event.id}
                    className="px-6 py-5 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Event Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/events/${event.id}`}
                          className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors inline-flex items-center gap-1 group"
                        >
                          {event.title}
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge
                            status={event.payment_status}
                            type="payment"
                          />
                          {event.event_date && (
                            <span className="text-xs text-gray-400">
                              {formatDate(event.event_date)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Amount Breakdown */}
                      <div className="flex items-center gap-6 text-sm sm:flex-shrink-0">
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-0.5">Total</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(total)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-0.5">Paid</p>
                          <p className="font-semibold text-gray-700">
                            {formatCurrency(paid)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-0.5">Remaining</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(remaining)}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="sm:w-40 flex-shrink-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-gray-500">
                            {percentage}% paid
                          </span>
                        </div>
                        <div
                          className={`h-2.5 rounded-full overflow-hidden ${getProgressTrack(percentage)}`}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
