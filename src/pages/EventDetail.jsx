import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CalendarDays, Clock, Users, Building2, DollarSign,
  Edit3, Trash2, ArrowLeft, Plus, CreditCard, ChevronRight,
  MapPin, Tag, FileText, CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react';
import Card, { CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input, { Select, Textarea } from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { formatCurrency, formatDate, formatTime, capitalize, getInitials } from '../lib/formatters';
import { PAYMENT_TYPES, PAYMENT_METHODS } from '../lib/constants';

const STATUS_STEPS = ['inquiry', 'proposal', 'confirmed', 'completed'];
const STEP_COLORS = {
  inquiry: { active: 'bg-gray-900' },
  proposal: { active: 'bg-gray-900' },
  confirmed: { active: 'bg-gray-900' },
  completed: { active: 'bg-gray-900' },
};
const TRANSITIONS = {
  inquiry: ['proposal', 'cancelled'],
  proposal: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const { data: event, loading, refetch } = useApi(`/events/${id}`);
  const { data: payments, loading: paymentsLoading, refetch: refetchPayments } = useApi(`/events/${id}/payments`);
  const [paymentModal, setPaymentModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '', payment_type: 'deposit', payment_method: 'credit_card', payment_date: new Date().toISOString().split('T')[0], notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Event not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/events')}>
          Back to Events
        </Button>
      </div>
    );
  }

  const paymentList = payments || event.payments || [];
  const paidAmount = paymentList.reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Math.max(0, event.total_amount - paidAmount);
  const paidPercent = event.total_amount > 0 ? Math.min(100, (paidAmount / event.total_amount) * 100) : 0;
  const currentStepIdx = STATUS_STEPS.indexOf(event.status);
  const allowedTransitions = TRANSITIONS[event.status] || [];

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/events/${id}/status`, { status: newStatus });
      addToast(`Status updated to ${capitalize(newStatus)}`, 'success');
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/events/${id}/payments`, { ...paymentForm, event_id: parseInt(id), amount: parseFloat(paymentForm.amount) });
      addToast('Payment recorded successfully', 'success');
      setPaymentModal(false);
      setPaymentForm({ amount: '', payment_type: 'deposit', payment_method: 'credit_card', payment_date: new Date().toISOString().split('T')[0], notes: '' });
      refetchPayments();
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      await api.del(`/events/${id}/payments/${paymentId}`);
      addToast('Payment removed', 'success');
      refetchPayments();
      refetch();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await api.del(`/events/${id}`);
      addToast('Event deleted', 'success');
      navigate('/events');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </button>

      {/* Hero Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{event.title}</h1>
              <Badge status={event.status} />
            </div>
            {event.description && <p className="text-gray-500 max-w-2xl">{event.description}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to={`/events/${id}/edit`}>
              <Button variant="outline" size="sm"><Edit3 className="w-4 h-4" /> Edit</Button>
            </Link>
            <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(true)}>
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </div>
        </div>

        {/* Status Timeline */}
        {event.status !== 'cancelled' && (
          <div className="mt-8">
            <div className="flex items-center justify-between max-w-xl">
              {STATUS_STEPS.map((step, idx) => {
                const isActive = idx === currentStepIdx;
                const isCompleted = idx < currentStepIdx;
                const colors = STEP_COLORS[step];
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                        ${isCompleted ? `${colors.active} text-white border-transparent` : ''}
                        ${isActive ? `${colors.active} text-white border-transparent ring-4 ring-gray-200` : ''}
                        ${!isCompleted && !isActive ? 'bg-gray-100 text-gray-400 border-gray-200' : ''}
                      `}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                        {capitalize(step)}
                      </span>
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 mt-[-20px] ${idx < currentStepIdx ? 'bg-gray-900' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {event.status === 'cancelled' && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-700">This event has been cancelled</span>
          </div>
        )}

        {/* Status Actions */}
        {allowedTransitions.length > 0 && (
          <div className="mt-6 flex items-center gap-2">
            <span className="text-sm text-gray-500 mr-2">Move to:</span>
            {allowedTransitions.map((status) => (
              <Button
                key={status}
                variant={status === 'cancelled' ? 'danger' : 'secondary'}
                size="sm"
                onClick={() => handleStatusChange(status)}
              >
                {capitalize(status)}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-3 text-gray-500 mb-4">
            <CalendarDays className="w-5 h-5" />
            <span className="font-medium">Date & Time</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{formatDate(event.event_date)}</p>
          <p className="text-sm text-gray-500">{formatTime(event.start_time)} - {formatTime(event.end_time)}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-3 text-gray-500 mb-4">
            <Users className="w-5 h-5" />
            <span className="font-medium">Guest Count</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{event.guest_count || '—'} guests</p>
          <p className="text-sm text-gray-500">{capitalize(event.event_type || 'Event')}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-3 text-gray-500 mb-4">
            <Building2 className="w-5 h-5" />
            <span className="font-medium">Venue</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{event.space_name || 'Not assigned'}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-3 text-gray-500 mb-4">
            <DollarSign className="w-5 h-5" />
            <span className="font-medium">Total Amount</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(event.total_amount)}</p>
          <div className="mt-2">
            <Badge status={event.payment_status} type="payment" />
          </div>
        </Card>
      </div>

      {/* Contact + Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Card */}
        <Card>
          <CardHeader title="Contact" />
          {event.contact_first_name ? (
            <Link to={`/contacts/${event.contact_id}`} className="group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center text-white text-lg font-bold">
                  {getInitials(event.contact_first_name, event.contact_last_name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:underline">
                    {event.contact_first_name} {event.contact_last_name}
                  </p>
                  {event.contact_email && <p className="text-sm text-gray-500">{event.contact_email}</p>}
                  {event.contact_phone && <p className="text-sm text-gray-500">{event.contact_phone}</p>}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
              </div>
            </Link>
          ) : (
            <p className="text-sm text-gray-400">No contact assigned</p>
          )}
        </Card>

        {/* Payments Section */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Payments & Deposits"
            action={
              <Button size="sm" onClick={() => setPaymentModal(true)}>
                <Plus className="w-4 h-4" /> Record Payment
              </Button>
            }
          />

          {/* Payment Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(event.total_amount)}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Paid</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(paidAmount)}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Remaining</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(remaining)}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Payment Progress</span>
              <span>{paidPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gray-900"
                style={{ width: `${paidPercent}%` }}
              />
            </div>
          </div>

          {/* Payment History */}
          {paymentsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : paymentList.length > 0 ? (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full">
                <thead>
                  <tr className="border-y border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Type</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Method</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Amount</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Notes</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paymentList.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-3 text-sm text-gray-600">{formatDate(payment.payment_date)}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-700">
                          {capitalize(payment.payment_type)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{capitalize(payment.payment_method?.replace('_', ' '))}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(payment.amount)}</td>
                      <td className="px-6 py-3 text-sm text-gray-500 max-w-[200px] truncate">{payment.notes || '-'}</td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Delete payment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No payments recorded yet</p>
            </div>
          )}
        </Card>
      </div>

      {/* Notes */}
      {event.notes && (
        <Card>
          <CardHeader title="Notes" />
          <p className="text-gray-600 whitespace-pre-wrap">{event.notes}</p>
        </Card>
      )}

      {/* Payment Modal */}
      <Modal isOpen={paymentModal} onClose={() => setPaymentModal(false)} title="Record Payment">
        <form onSubmit={handlePayment} className="space-y-4">
          <Input
            label="Amount ($)"
            type="number"
            step="0.01"
            min="0"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Payment Type"
              value={paymentForm.payment_type}
              onChange={(e) => setPaymentForm({ ...paymentForm, payment_type: e.target.value })}
            >
              {PAYMENT_TYPES.map((t) => (
                <option key={t} value={t}>{capitalize(t)}</option>
              ))}
            </Select>
            <Select
              label="Payment Method"
              value={paymentForm.payment_method}
              onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{capitalize(m.replace('_', ' '))}</option>
              ))}
            </Select>
          </div>
          <Input
            label="Payment Date"
            type="date"
            value={paymentForm.payment_date}
            onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
          />
          <Textarea
            label="Notes"
            value={paymentForm.notes}
            onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
            placeholder="Optional payment notes..."
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setPaymentModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Delete Event" size="sm">
        <p className="text-gray-600 mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteEvent}>Delete Event</Button>
        </div>
      </Modal>
    </div>
  );
}
