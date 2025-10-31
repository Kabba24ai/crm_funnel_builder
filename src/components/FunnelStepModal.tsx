import React, { useState, useEffect } from 'react';
import { X, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { FunnelStep, MessageTemplate, TriggerCondition } from '../types/funnel';

interface FunnelStepModalProps {
  funnelId: string;
  step: FunnelStep | null;
  existingSteps: FunnelStep[];
  onClose: () => void;
  onSave: () => void;
}

const TRIGGER_OPTIONS: { value: TriggerCondition; label: string }[] = [
  { value: 'rental_created', label: 'Rental Created' },
  { value: 'rental_active', label: 'Rental Active' },
  { value: 'before_return', label: 'Before Return' },
  { value: 'after_return', label: 'After Return' },
  { value: 'custom', label: 'Custom' },
];

const FunnelStepModal: React.FC<FunnelStepModalProps> = ({
  funnelId,
  step,
  existingSteps,
  onClose,
  onSave,
}) => {
  const [stepNumber, setStepNumber] = useState(1);
  const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');
  const [messageId, setMessageId] = useState('');
  const [delayDays, setDelayDays] = useState(0);
  const [triggerCondition, setTriggerCondition] = useState<TriggerCondition>('rental_created');
  const [messages, setMessages] = useState<MessageTemplate[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<MessageTemplate | null>(null);

  useEffect(() => {
    if (step) {
      setStepNumber(step.step_number);
      setMessageType(step.message_type);
      setMessageId(step.message_id);
      setDelayDays(step.delay_days);
      setTriggerCondition(step.trigger_condition as TriggerCondition);
    } else {
      const nextStep = existingSteps.length > 0
        ? Math.max(...existingSteps.map((s) => s.step_number)) + 1
        : 1;
      setStepNumber(nextStep);
    }
  }, [step, existingSteps]);

  useEffect(() => {
    loadMessages();
  }, [messageType]);

  useEffect(() => {
    if (messageId) {
      const msg = messages.find((m) => m.id === messageId);
      setSelectedMessage(msg || null);
    } else {
      setSelectedMessage(null);
    }
  }, [messageId, messages]);

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('message_type', messageType)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      if (!step) {
        setMessageId('');
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (step) {
        const { error: updateError } = await supabase
          .from('funnel_steps')
          .update({
            step_number: stepNumber,
            message_id: messageId,
            message_type: messageType,
            delay_days: delayDays,
            trigger_condition: triggerCondition,
          })
          .eq('id', step.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('funnel_steps').insert({
          funnel_id: funnelId,
          step_number: stepNumber,
          message_id: messageId,
          message_type: messageType,
          delay_days: delayDays,
          trigger_condition: triggerCondition,
        });

        if (insertError) throw insertError;
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">
            {step ? 'Edit Funnel Step' : 'Add Funnel Step'}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={stepNumber}
                onChange={(e) => setStepNumber(parseInt(e.target.value) || 1)}
                min={1}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delay (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={delayDays}
                onChange={(e) => setDelayDays(parseInt(e.target.value) || 0)}
                min={0}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">0 = immediate</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trigger Condition <span className="text-red-500">*</span>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="sms"
                  checked={messageType === 'sms'}
                  onChange={(e) => setMessageType(e.target.value as 'sms')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <MessageSquare size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">SMS</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="email"
                  checked={messageType === 'email'}
                  onChange={(e) => setMessageType(e.target.value as 'email')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <Mail size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Email</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Message <span className="text-red-500">*</span>
            </label>
            {loadingMessages ? (
              <div className="text-sm text-gray-500 py-2">Loading messages...</div>
            ) : (
              <select
                value={messageId}
                onChange={(e) => setMessageId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a message...</option>
                {messages.map((msg) => (
                  <option key={msg.id} value={msg.id}>
                    {msg.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedMessage && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Message Preview</h4>
              {selectedMessage.message_type === 'email' && selectedMessage.subject && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-500">Subject:</span>
                  <p className="text-sm text-gray-900">{selectedMessage.subject}</p>
                </div>
              )}
              <div>
                <span className="text-xs font-medium text-gray-500">Content:</span>
                <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">
                  {selectedMessage.body}
                </p>
              </div>
            </div>
          )}

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
              disabled={saving || !messageId}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : step ? 'Update Step' : 'Add Step'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FunnelStepModal;
