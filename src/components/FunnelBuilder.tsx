import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Copy, Power, PowerOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SalesFunnel, FunnelStep } from '../types/funnel';
import FunnelForm from './FunnelForm';
import FunnelStepModal from './FunnelStepModal';
import FunnelTimeline from './FunnelTimeline';

const FunnelBuilder: React.FC = () => {
  const [funnels, setFunnels] = useState<SalesFunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<SalesFunnel | null>(null);
  const [selectedFunnel, setSelectedFunnel] = useState<string | null>(null);
  const [funnelSteps, setFunnelSteps] = useState<Record<string, FunnelStep[]>>({});
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState<FunnelStep | null>(null);

  useEffect(() => {
    loadFunnels();
  }, []);

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
        .select('*')
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

      {funnels.length === 0 ? (
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
      ) : (
        <div className="space-y-4">
          {funnels.map((funnel) => (
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
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{funnel.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          funnel.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {funnel.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {funnel.step_count} {funnel.step_count === 1 ? 'step' : 'steps'}
                      </span>
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
                    onAddStep={() => handleAddStep(funnel.id)}
                    onEditStep={handleEditStep}
                    onDeleteStep={(stepId) => deleteStep(stepId, funnel.id)}
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
          onSave={() => {
            loadFunnels();
            setShowForm(false);
            setEditingFunnel(null);
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
