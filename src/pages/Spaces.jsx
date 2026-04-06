import { useState } from 'react';
import {
  Plus, Users, DollarSign, Trash2, Edit3, MapPin, Clock,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input, { Textarea } from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/formatters';

const emptyForm = {
  name: '',
  description: '',
  capacity: '',
  hourly_rate: '',
};

const MAX_CAPACITY = 500;

export default function Spaces() {
  const addToast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: spaces, loading, refetch } = useApi('/spaces');

  const openAddModal = () => {
    setEditingSpace(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (e, space) => {
    e.stopPropagation();
    setEditingSpace(space);
    setForm({
      name: space.name || '',
      description: space.description || '',
      capacity: space.capacity?.toString() || '',
      hourly_rate: space.hourly_rate?.toString() || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSpace(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      capacity: form.capacity ? parseInt(form.capacity, 10) : null,
      hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
    };
    try {
      if (editingSpace) {
        await api.put(`/spaces/${editingSpace.id}`, payload);
        addToast('Space updated successfully', 'success');
      } else {
        await api.post('/spaces', payload);
        addToast('Space created successfully', 'success');
      }
      closeModal();
      refetch();
    } catch (err) {
      addToast(err.message || 'Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (space) => {
    try {
      await api.del(`/spaces/${space.id}`);
      addToast('Space deactivated successfully', 'success');
      setDeleteConfirm(null);
      refetch();
    } catch (err) {
      addToast(err.message || 'Failed to deactivate space', 'error');
    }
  };

  if (loading && !spaces) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spaces & Venues</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your rooms, halls, and venues
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4" />
          Add Space
        </Button>
      </div>

      {/* Space Grid */}
      {spaces && spaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spaces.map((space) => {
            const capacityPercent = space.capacity
              ? Math.min((space.capacity / MAX_CAPACITY) * 100, 100)
              : 0;
            const isActive = space.active !== false;

            return (
              <Card key={space.id} hover className="group relative">
                {/* Active/Inactive Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}
                    />
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Name & Description */}
                  <div className="pr-20">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">
                      {space.name}
                    </h3>
                    {space.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {space.description}
                      </p>
                    )}
                  </div>

                  {/* Capacity */}
                  {space.capacity != null && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>Capacity</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {space.capacity} guests
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gray-900 transition-all duration-500"
                          style={{ width: `${capacityPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Hourly Rate */}
                  {space.hourly_rate != null && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Hourly Rate</p>
                        <p className="text-sm font-bold text-gray-900">
                          {formatCurrency(space.hourly_rate)}
                          <span className="text-xs font-normal text-gray-400"> /hr</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => openEditModal(e, space)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(space);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Deactivate
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={MapPin}
          title="No spaces yet"
          message="Get started by adding your first venue or room"
          actionLabel="Add Space"
          onAction={openAddModal}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingSpace ? 'Edit Space' : 'Add Space'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Grand Ballroom"
            required
          />
          <Textarea
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the space, amenities, features..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Capacity"
              name="capacity"
              type="number"
              min="0"
              value={form.capacity}
              onChange={handleChange}
              placeholder="150"
            />
            <Input
              label="Hourly Rate ($)"
              name="hourly_rate"
              type="number"
              min="0"
              step="0.01"
              value={form.hourly_rate}
              onChange={handleChange}
              placeholder="250.00"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingSpace ? 'Update Space' : 'Create Space'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Deactivate Space"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to deactivate{' '}
            <span className="font-semibold text-gray-900">{deleteConfirm?.name}</span>?
            This space will no longer be available for new bookings.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => handleDeactivate(deleteConfirm)}>
              <Trash2 className="w-4 h-4" />
              Deactivate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
