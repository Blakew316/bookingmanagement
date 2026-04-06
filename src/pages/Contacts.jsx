import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Mail, Phone, Building2, Trash2, Edit3, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input, { Textarea } from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { formatPhone, getInitials } from '../lib/formatters';

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  company: '',
  notes: '',
};

export default function Contacts() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: contacts, loading, refetch } = useApi(`/contacts?search=${debouncedSearch}`, [debouncedSearch]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openAddModal = () => {
    setEditingContact(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (e, contact) => {
    e.stopPropagation();
    setEditingContact(contact);
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

  const closeModal = () => {
    setModalOpen(false);
    setEditingContact(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingContact) {
        await api.put(`/contacts/${editingContact.id}`, form);
        addToast('Contact updated successfully', 'success');
      } else {
        await api.post('/contacts', form);
        addToast('Contact created successfully', 'success');
      }
      closeModal();
      refetch();
    } catch (err) {
      addToast(err.message || 'Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (contact) => {
    try {
      await api.del(`/contacts/${contact.id}`);
      addToast('Contact deleted successfully', 'success');
      setDeleteConfirm(null);
      refetch();
    } catch (err) {
      addToast(err.message || 'Failed to delete contact', 'error');
    }
  };

  if (loading && !contacts) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your clients and contacts
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4" />
          Add Contact
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search contacts by name, email, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 focus:outline-none transition-all"
        />
      </div>

      {/* Contact Grid */}
      {contacts && contacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <Card
              key={contact.id}
              hover
              className="group"
              onClick={() => navigate(`/contacts/${contact.id}`)}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {getInitials(contact.first_name, contact.last_name)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {contact.first_name} {contact.last_name}
                  </h3>

                  {contact.email && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-500 truncate">{contact.email}</span>
                    </div>
                  )}

                  {contact.phone && (
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-500">{formatPhone(contact.phone)}</span>
                    </div>
                  )}

                  {contact.company && (
                    <div className="flex items-center gap-2 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-500 truncate">{contact.company}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => openEditModal(e, contact)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(contact);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No contacts found"
          message={search ? 'Try adjusting your search terms' : 'Get started by adding your first contact'}
          actionLabel={!search ? 'Add Contact' : undefined}
          onAction={!search ? openAddModal : undefined}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingContact ? 'Edit Contact' : 'Add Contact'}
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
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingContact ? 'Update Contact' : 'Create Contact'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Contact"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900">
              {deleteConfirm?.first_name} {deleteConfirm?.last_name}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => handleDelete(deleteConfirm)}>
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
