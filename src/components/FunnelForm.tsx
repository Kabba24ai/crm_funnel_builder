import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SalesFunnel, TriggerCondition } from '../types/funnel';

interface FunnelFormProps {
  funnel: SalesFunnel | null;
  onClose: () => void;
  onSave: (funnelId?: string) => void;
}

const TRIGGER_OPTIONS: { value: TriggerCondition; label: string; description: string }[] = [
  { value: 'rental_created', label: 'Rental Created', description: 'Triggers when a new rental is created' },
  { value: 'rental_active', label: 'Rental Active', description: 'Triggers when rental becomes active' },
  { value: 'before_return', label: 'Before Return', description: 'Triggers before the rental return date' },
  { value: 'after_return', label: 'After Return', description: 'Triggers after the rental is returned' },
  { value: 'custom', label: 'Custom', description: 'Custom trigger event' },
];

const FunnelForm: React.FC<FunnelFormProps> = ({ funnel, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerCondition, setTriggerCondition] = useState<TriggerCondition>('rental_created');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (funnel) {
      setName(funnel.name);
      setDescription(funnel.description || '');
      setTriggerCondition(funnel.trigger_condition as TriggerCondition);
      setIsActive(funnel.is_active);
    }
  }, [funnel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (funnel) {
        const { error: updateError } = await supabase
          .from('sales_funnels')
          .update({
            name,
            description: description || null,
            trigger_condition: triggerCondition,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', funnel.id);

        if (updateError) throw updateError;
        onSave();
      } else {
        const { data: newFunnel, error: insertError } = await supabase
          .from('sales_funnels')
          .insert({
            name,
            description: description || null,
            trigger_condition: triggerCondition,
            is_active: isActive,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        onSave(newFunnel.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {funnel ? 'Edit Funnel' : 'Create New Funnel'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Funnel Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Welcome Series"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of this funnel's purpose"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trigger Event <span className="text-red-500">*</span>
            </label>
            <select
              value={triggerCondition}
              onChange={(e) => setTriggerCondition(e.target.value as TriggerCondition)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {TRIGGER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {TRIGGER_OPTIONS.find(opt => opt.value === triggerCondition)?.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Set as active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : funnel ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FunnelForm;
