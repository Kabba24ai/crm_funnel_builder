import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { categoriesApi, funnelsApi } from '../lib/api';
import type { SalesFunnel, TriggerCondition } from '../types/funnel';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface FunnelFormProps {
  funnel: SalesFunnel | null;
  onClose: () => void;
  onSave: (funnelId?: string) => void;
}

const TRIGGER_OPTIONS: { value: TriggerCondition; label: string; description: string }[] = [
  { value: 'rental_start_date', label: 'Rental Start Date', description: 'Triggers based on the rental start date' },
  { value: 'new_lead_added', label: 'New Lead Added', description: 'Triggers when a new lead is added to the system' },
];

const MINUTE_OPTIONS = [15, 30, 45];
const HOUR_OPTIONS = Array.from({ length: 23 }, (_, i) => i + 1);

const FunnelForm: React.FC<FunnelFormProps> = ({ funnel, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [triggerCondition, setTriggerCondition] = useState<TriggerCondition>('rental_start_date');
  const [triggerDelayValue, setTriggerDelayValue] = useState(0);
  const [triggerDelayUnit, setTriggerDelayUnit] = useState<'minutes' | 'hours' | 'days'>('days');
  const [triggerDelayDirection, setTriggerDelayDirection] = useState<'before' | 'after'>('after');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
    if (funnel) {
      setName(funnel.name);
      setDescription(funnel.description || '');
      setCategoryId(funnel.category_id || '');
      setTriggerCondition(funnel.trigger_condition as TriggerCondition);
      setTriggerDelayValue(Math.abs(funnel.trigger_delay_value));
      setTriggerDelayUnit(funnel.trigger_delay_unit);
      setTriggerDelayDirection(funnel.trigger_delay_value < 0 ? 'before' : 'after');
      setIsActive(funnel.is_active);
    }
  }, [funnel]);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const data = await categoriesApi.create({ name: newCategoryName.trim(), color: '#3B82F6' });

      setCategories([...categories, data]);
      setCategoryId(data.id);
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const finalTriggerDelayValue = triggerDelayDirection === 'before'
        ? -Math.abs(triggerDelayValue)
        : Math.abs(triggerDelayValue);

      if (funnel) {
        await funnelsApi.update(funnel.id, {
          name,
          description: description || null,
          category_id: categoryId || null,
          trigger_condition: triggerCondition,
          trigger_delay_value: finalTriggerDelayValue,
          trigger_delay_unit: triggerDelayUnit,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        });
        onSave();
      } else {
        const newFunnel = await funnelsApi.create({
          name,
          description: description || null,
          category_id: categoryId || null,
          trigger_condition: triggerCondition,
          trigger_delay_value: finalTriggerDelayValue,
          trigger_delay_unit: triggerDelayUnit,
          is_active: isActive,
        });
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            {!showNewCategoryInput ? (
              <div className="flex gap-2">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryInput(true)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Add new category"
                >
                  <Plus size={20} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="New category name"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategoryName('');
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            )}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Funnel Start Timing <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer flex-1">
                  <input
                    type="radio"
                    value="before"
                    checked={triggerDelayDirection === 'before'}
                    onChange={(e) => setTriggerDelayDirection(e.target.value as 'before')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Before Event</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer flex-1">
                  <input
                    type="radio"
                    value="after"
                    checked={triggerDelayDirection === 'after'}
                    onChange={(e) => setTriggerDelayDirection(e.target.value as 'after')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">After Event</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={triggerDelayUnit}
                  onChange={(e) => setTriggerDelayUnit(e.target.value as 'minutes' | 'hours' | 'days')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
                <input
                  type="number"
                  value={triggerDelayValue}
                  onChange={(e) => setTriggerDelayValue(Math.abs(parseInt(e.target.value) || 0))}
                  min={0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0 = at event"
                />
              </div>
              <p className="text-xs text-gray-500">
                Funnel starts {triggerDelayValue === 0 ? 'at' : `${triggerDelayValue} ${triggerDelayUnit} ${triggerDelayDirection}`} the trigger event
              </p>
            </div>
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
