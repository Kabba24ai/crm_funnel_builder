import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Copy, Power, PowerOff, Zap, Filter, Pencil } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SalesFunnel, FunnelStep } from '../types/funnel';
import FunnelForm from './FunnelForm';
import FunnelStepModal from './FunnelStepModal';
import FunnelTimeline from './FunnelTimeline';

interface Category {
  id: string;
  name: string;
  color: string;
}

const FunnelBuilder: React.FC = () => {
  const [funnels, setFunnels] = useState<SalesFunnel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<SalesFunnel | null>(null);
  const [selectedFunnel, setSelectedFunnel] = useState<string | null>(null);
  const [funnelSteps, setFunnelSteps] = useState<Record<string, FunnelStep[]>>({});
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState<FunnelStep | null>(null);

  useEffect(() => {
    loadCategories();
    loadFunnels();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('funnel_categories')
        .select('id, name, color')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadFunnels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales_funnels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const funnelsWithStepCount = await Promise.all(
        (data || []).map(async (funnel) => {
          const { count } = await supabase
            .from('funnel_steps')
            .select('*', { count: 'exact', head: true })
            .eq('funnel_id', funnel.id);
          return { ...funnel, step_count: count || 0 };
        })
      );

      setFunnels(funnelsWithStepCount);
    } catch (error) {
      console.error('Error loading funnels:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFunnelSteps = async (funnelId: string) => {
    try {
      const { data, error } = await supabase
        .from('funnel_steps')
        .select(`
          *,
          message_templates (
            name,
            content,
            subject
          )
        `)
        .eq('funnel_id', funnelId)
        .order('step_number', { ascending: true });

      if (error) throw error;
      setFunnelSteps((prev) => ({ ...prev, [funnelId]: data || [] }));
    } catch (error) {
      console.error('Error loading funnel steps:', error);
    }
  };

  const toggleFunnelActive = async (funnel: SalesFunnel) => {
    try {
      const { error } = await supabase
        .from('sales_funnels')
        .update({ is_active: !funnel.is_active, updated_at: new Date().toISOString() })
        .eq('id', funnel.id);

      if (error) throw error;
      loadFunnels();
    } catch (error) {
      console.error('Error toggling funnel:', error);
    }
  };

  const deleteFunnel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this funnel? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.from('sales_funnels').delete().eq('id', id);
      if (error) throw error;
      loadFunnels();
      if (selectedFunnel === id) {
        setSelectedFunnel(null);
      }
    } catch (error) {
      console.error('Error deleting funnel:', error);
    }
  };

  const duplicateFunnel = async (funnel: SalesFunnel) => {
    try {
      const { data: newFunnel, error: funnelError } = await supabase
        .from('sales_funnels')
        .insert({
          name: `${funnel.name} (Copy)`,
          description: funnel.description,
          is_active: false,
        })
        .select()
        .single();

      if (funnelError) throw funnelError;

      const steps = funnelSteps[funnel.id] || [];
      if (steps.length > 0) {
        const { error: stepsError } = await supabase.from('funnel_steps').insert(
          steps.map((step) => ({
            funnel_id: newFunnel.id,
            step_number: step.step_number,
            message_id: step.message_id,
            message_type: step.message_type,
            delay_days: step.delay_days,
            trigger_condition: step.trigger_condition,
          }))
        );

        if (stepsError) throw stepsError;
      }

      loadFunnels();
    } catch (error) {
      console.error('Error duplicating funnel:', error);
    }
  };

  const handleFunnelClick = (funnelId: string) => {
    if (selectedFunnel === funnelId) {
      setSelectedFunnel(null);
    } else {
      setSelectedFunnel(funnelId);
      if (!funnelSteps[funnelId]) {
        loadFunnelSteps(funnelId);
      }
    }
  };

  const handleAddStep = (funnelId: string) => {
    setSelectedFunnel(funnelId);
    setEditingStep(null);
    setShowStepModal(true);
  };

  const handleEditStep = (step: FunnelStep) => {
    setEditingStep(step);
    setShowStepModal(true);
  };

  const deleteStep = async (stepId: string, funnelId: string) => {
    if (!confirm('Are you sure you want to delete this step?')) {
      return;
    }

    try {
      const { error } = await supabase.from('funnel_steps').delete().eq('id', stepId);
      if (error) throw error;
      loadFunnelSteps(funnelId);
      loadFunnels();
    } catch (error) {
      console.error('Error deleting step:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading funnels...</div>
      </div>
    );
  }

  const filteredFunnels = selectedCategoryId === 'uncategorized'
    ? funnels.filter(funnel => !funnel.category_id)
    : selectedCategoryId
    ? funnels.filter(funnel => funnel.category_id === selectedCategoryId)
    : funnels;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Sales Funnels</h2>
        <button
          onClick={() => {
            setEditingFunnel(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Create Funnel
        </button>
      </div>

      {categories.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Filter size={18} className="text-gray-500" />
            <h3 className="font-medium text-gray-900">Filter by Category</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategoryId === null
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Funnels ({funnels.length})
            </button>
            {categories.map((category) => {
              const categoryFunnelCount = funnels.filter(f => f.category_id === category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategoryId === category.id
                      ? 'text-white shadow-sm'
                      : 'text-gray-700 hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: selectedCategoryId === category.id
                      ? category.color
                      : `${category.color}20`,
                  }}
                >
                  {category.name} ({categoryFunnelCount})
                </button>
              );
            })}
            <button
              onClick={() => setSelectedCategoryId('uncategorized')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategoryId === 'uncategorized'
                  ? 'bg-gray-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Uncategorized ({funnels.filter(f => !f.category_id).length})
            </button>
          </div>
        </div>
      )}

      {filteredFunnels.length === 0 && funnels.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <Plus size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No funnels yet</h3>
          <p className="text-gray-500 mb-4">Create your first funnel to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Funnel
          </button>
        </div>
      ) : filteredFunnels.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Filter size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No funnels in this category</h3>
          <p className="text-gray-500 mb-4">Try selecting a different category or create a new funnel</p>
          <button
            onClick={() => setSelectedCategoryId(null)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View All Funnels
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFunnels.map((funnel) => (
            <div
              key={funnel.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleFunnelClick(funnel.id)}
                  >
                    <div className="grid grid-cols-3 gap-6 items-start mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{funnel.name}</h3>
                        <span className="text-sm text-gray-500">
                          {funnel.step_count} {funnel.step_count === 1 ? 'Step' : 'Steps'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Zap size={12} />
                          <span>Event: {funnel.trigger_condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </div>
                        <span>•</span>
                        <span>
                          Starts {funnel.trigger_delay_value === 0
                            ? 'at event'
                            : `${Math.abs(funnel.trigger_delay_value)} ${funnel.trigger_delay_unit} ${funnel.trigger_delay_value < 0 ? 'before' : 'after'}`
                          }
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            funnel.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {funnel.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    {funnel.description && (
                      <p className="text-gray-600 text-sm">{funnel.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFunnelActive(funnel)}
                      className={`p-2 rounded-lg transition-colors ${
                        funnel.is_active
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={funnel.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {funnel.is_active ? <Power size={18} /> : <PowerOff size={18} />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingFunnel(funnel);
                        setShowForm(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => duplicateFunnel(funnel)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      onClick={() => deleteFunnel(funnel.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {selectedFunnel === funnel.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <FunnelTimeline
                    steps={funnelSteps[funnel.id] || []}
                    triggerCondition={funnel.trigger_condition}
                    triggerDelayValue={funnel.trigger_delay_value}
                    triggerDelayUnit={funnel.trigger_delay_unit}
                    onAddStep={() => handleAddStep(funnel.id)}
                    onEditStep={handleEditStep}
                    onDeleteStep={(stepId) => deleteStep(stepId, funnel.id)}
                    onReorder={() => loadFunnelSteps(funnel.id)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <FunnelForm
          funnel={editingFunnel}
          onClose={() => {
            setShowForm(false);
            setEditingFunnel(null);
          }}
          onSave={(funnelId) => {
            loadFunnels();
            setShowForm(false);
            setEditingFunnel(null);
            if (funnelId) {
              setSelectedFunnel(funnelId);
              loadFunnelSteps(funnelId);
            }
          }}
        />
      )}

      {showStepModal && selectedFunnel && (
        <FunnelStepModal
          funnelId={selectedFunnel}
          step={editingStep}
          existingSteps={funnelSteps[selectedFunnel] || []}
          onClose={() => {
            setShowStepModal(false);
            setEditingStep(null);
          }}
          onSave={() => {
            loadFunnelSteps(selectedFunnel);
            loadFunnels();
            setShowStepModal(false);
            setEditingStep(null);
          }}
        />
      )}
    </div>
  );
};

export default FunnelBuilder;
