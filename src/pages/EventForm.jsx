import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { Select, Textarea } from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { EVENT_TYPES } from '../lib/constants';
import { capitalize } from '../lib/formatters';

const emptyForm = {
  title: '',
  description: '',
  contact_id: '',
  space_id: '',
  event_date: '',
  start_time: '',
  end_time: '',
  guest_count: '',
  event_type: 'corporate',
  total_amount: '',
  notes: '',
};

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const isEdit = Boolean(id);

  const { data: contacts } = useApi('/contacts');
  const { data: spaces } = useApi('/spaces');
  const { data: existingEvent, loading: eventLoading } = useApi(
    isEdit ? `/events/${id}` : '/events?_noop=1'
  );

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && existingEvent && !Array.isArray(existingEvent)) {
      setForm({
        title: existingEvent.title || '',
        description: existingEvent.description || '',
        contact_id: existingEvent.contact_id?.toString() || '',
        space_id: existingEvent.space_id?.toString() || '',
        event_date: existingEvent.event_date || '',
        start_time: existingEvent.start_time || '',
        end_time: existingEvent.end_time || '',
        guest_count: existingEvent.guest_count?.toString() || '',
        event_type: existingEvent.event_type || 'corporate',
        total_amount: existingEvent.total_amount?.toString() || '',
        notes: existingEvent.notes || '',
      });
    }
  }, [isEdit, existingEvent]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.event_date) newErrors.event_date = 'Event date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        contact_id: form.contact_id ? parseInt(form.contact_id) : null,
        space_id: form.space_id ? parseInt(form.space_id) : null,
        guest_count: form.guest_count ? parseInt(form.guest_count) : null,
        total_amount: form.total_amount ? parseFloat(form.total_amount) : 0,
      };

      if (isEdit) {
        await api.put(`/events/${id}`, payload);
        addToast('Event updated successfully', 'success');
        navigate(`/events/${id}`);
      } else {
        const result = await api.post('/events', payload);
        addToast('Event created successfully', 'success');
        navigate(`/events/${result.id}`);
      }
    } catch (err) {
      addToast(err.message || 'Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && eventLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate(isEdit ? `/events/${id}` : '/events')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {isEdit ? 'Back to Event' : 'Back to Events'}
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
        <p className="text-gray-500 mt-1">{isEdit ? 'Update event details below' : 'Fill in the details to create a new event'}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Event Details</h3>
            <div className="space-y-4">
              <Input label="Event Title *" placeholder="e.g. Johnson Wedding Reception" value={form.title} onChange={handleChange('title')} error={errors.title} required />
              <Textarea label="Description" placeholder="Brief description of the event..." value={form.description} onChange={handleChange('description')} />
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Date & Time</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Event Date *" type="date" value={form.event_date} onChange={handleChange('event_date')} error={errors.event_date} required />
              <Input label="Start Time" type="time" value={form.start_time} onChange={handleChange('start_time')} />
              <Input label="End Time" type="time" value={form.end_time} onChange={handleChange('end_time')} />
            </div>
          </div>

          {/* Venue & Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Venue & Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="Contact" value={form.contact_id} onChange={handleChange('contact_id')}>
                <option value="">Select a contact...</option>
                {contacts?.map((c) => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}{c.company ? ` (${c.company})` : ''}</option>
                ))}
              </Select>
              <Select label="Space / Venue" value={form.space_id} onChange={handleChange('space_id')}>
                <option value="">Select a space...</option>
                {spaces?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} (Cap: {s.capacity})</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Event Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Event Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select label="Event Type" value={form.event_type} onChange={handleChange('event_type')}>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{capitalize(t)}</option>
                ))}
              </Select>
              <Input label="Guest Count" type="number" min="0" placeholder="150" value={form.guest_count} onChange={handleChange('guest_count')} />
              <Input label="Total Amount ($)" type="number" step="0.01" min="0" placeholder="5000.00" value={form.total_amount} onChange={handleChange('total_amount')} />
            </div>
          </div>

          {/* Notes */}
          <Textarea label="Notes" placeholder="Additional notes, special requests, dietary requirements..." value={form.notes} onChange={handleChange('notes')} />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => navigate(isEdit ? `/events/${id}` : '/events')}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              <Save className="w-4 h-4" />
              {submitting ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
