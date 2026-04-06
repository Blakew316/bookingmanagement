import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Building2, Edit3, Trash2,
  Calendar, DollarSign, CalendarDays,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input, { Textarea } from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { formatCurrency, formatDate, formatPhone, getInitials } from '../lib/formatters';

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });

  const { data: contact, loading, refetch } = useApi(`/contacts/${id}`);
  const { data: events, loading: eventsLoading } = useApi(`/contacts/${id}/events`);

  const openEditModal = () => {
    if (!contact) return;
    setForm({
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      notes: contact.notes || '',
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/contacts/${id}`, form);
      addToast('Contact updated successfully', 'success');
      setModalOpen(false);
      refetch();
    } catch (err) {
      addToast(err.message || 'Failed to update contact', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.del(`/contacts/${id}`);
      addToast('Contact deleted successfully', 'success');
      navigate('/contacts');
    } catch (err) {
      addToast(err.message || 'Failed to delete contact', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!contact) {
    return (
      <EmptyState
        title="Contact not found"
        message="The contact you are looking for does not exist or has been removed."
        actionLabel="Back to Contacts"
        onAction={() => navigate('/contacts')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate('/contacts')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Contacts
      </button>

      {/* Contact Header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Large Avatar */}
          <div className="w-20 h-20 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-2xl">
              {getInitials(contact.first_name, contact.last_name)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              {contact.first_name} {contact.last_name}
            </h1>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm text-gray-900 hover:text-gray-600"
                  >
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{formatPhone(contact.phone)}</span>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{contact.company}</span>
                </div>
              )}
            </div>

            {contact.notes && (
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">{contact.notes}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={openEditModal}>
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(true)}>
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </Card>

      {/* Events Section */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Events</h2>

        {eventsLoading ? (
          <LoadingSpinner />
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <Card
                key={event.id}
                hover
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                    <Badge status={event.status} />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(event.event_date)}</span>
                  </div>

                  {event.total_amount != null && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {formatCurrency(event.total_amount)}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No events yet"
            message="This contact doesn't have any events associated with them."
          />
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit Contact"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="John"
              required
            />
            <Input
              label="Last Name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Doe"
              required
            />
          </div>
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john@example.com"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
          />
          <Input
            label="Company"
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="Acme Corp"
          />
          <Textarea
            label="Notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Additional notes..."
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Update Contact'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        title="Delete Contact"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900">
              {contact.first_name} {contact.last_name}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
