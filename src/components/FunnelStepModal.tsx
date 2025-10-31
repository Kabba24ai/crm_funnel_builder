import React, { useState, useEffect } from 'react';
import { X, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { FunnelStep, MessageTemplate } from '../types/funnel';

interface FunnelStepModalProps {
  funnelId: string;
  step: FunnelStep | null;
  existingSteps: FunnelStep[];
  onClose: () => void;
  onSave: () => void;
}

const FunnelStepModal: React.FC<FunnelStepModalProps> = ({
  funnelId,
  step,
  existingSteps,
  onClose,
  onSave,
}) => {
  const [stepNumber, setStepNumber] = useState(1);
  const [messageType, setMessageType] = useState<'sms' | 'email'>('sms');
  const [category, setCategory] = useState('');
  const [messageId, setMessageId] = useState('');
  const [delayUnit, setDelayUnit] = useState<'minutes' | 'hours' | 'days'>('days');
  const [delayValue, setDelayValue] = useState(0);
  const [messages, setMessages] = useState<MessageTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<MessageTemplate | null>(null);

  useEffect(() => {
    if (step) {
      setStepNumber(step.step_number);
      setMessageType(step.message_type);
      setMessageId(step.message_id);
      setDelayValue(step.delay_value);
      setDelayUnit(step.delay_unit);

      loadMessageCategory(step.message_id);
    } else {
      const nextStep = existingSteps.length > 0
        ? Math.max(...existingSteps.map((s) => s.step_number)) + 1
        : 1;
      setStepNumber(nextStep);
    }
  }, [step, existingSteps]);

  const loadMessageCategory = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('id', messageId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        if (data.category) {
          setCategory(data.category);
        }
        setSelectedMessage(data);
      }
    } catch (err) {
      console.error('Error loading message category:', err);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [messageType, category]);

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      let query = supabase
        .from('message_templates')
        .select('*')
        .eq('message_type', messageType)
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      if (!step) {
        setMessageId('');
      }

      const uniqueCategories = Array.from(
        new Set(
          (data || [])
            .map((m) => m.category)
            .filter((c): c is string => c != null && c.trim() !== '')
        )
      ).sort();
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('category')
        .eq('message_type', messageType)
        .eq('is_active', true);

      if (error) throw error;

      const uniqueCategories = Array.from(
        new Set(
          (data || [])
            .map((m) => m.category)
            .filter((c): c is string => c != null && c.trim() !== '')
        )
      ).sort();

      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [messageType]);

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
            delay_value: delayValue,
            delay_unit: delayUnit,
          })
          .eq('id', step.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('funnel_steps').insert({
          funnel_id: funnelId,
          step_number: stepNumber,
          message_id: messageId,
          message_type: messageType,
          delay_value: delayValue,
          delay_unit: delayUnit,
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
      <div className="bg-white rounded-lg shadow-xl w-full" style={{ maxWidth: '650px' }}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay from Funnel Start <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={delayUnit}
                  onChange={(e) => setDelayUnit(e.target.value as 'minutes' | 'hours' | 'days')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="days">Days</option>
                  <option value="hours">Hours</option>
                  <option value="minutes">Minutes</option>
                </select>
                <input
                  type="number"
                  value={delayValue}
                  onChange={(e) => setDelayValue(parseInt(e.target.value) || 0)}
                  min={0}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">0 = at funnel start</p>
            </div>

            <div>
              <div className="flex items-center gap-6 mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Message Type <span className="text-red-500">*</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="sms"
                    checked={messageType === 'sms'}
                    onChange={(e) => {
                      setMessageType(e.target.value as 'sms');
                      setCategory('');
                      setMessageId('');
                    }}
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
                    onChange={(e) => {
                      setMessageType(e.target.value as 'email');
                      setCategory('');
                      setMessageId('');
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <Mail size={18} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Email</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Message Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setMessageId('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Message <span className="text-red-500">*</span>
              </label>
              {loadingMessages ? (
                <div className="text-sm text-gray-500 py-2">Loading messages...</div>
              ) : (
                <select
                  value={messageId}
                  onChange={(e) => {
                    setMessageId(e.target.value);
                    const msg = messages.find(m => m.id === e.target.value);
                    setSelectedMessage(msg || null);
                  }}
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
          </div>

          {selectedMessage && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Message Preview</h4>
              <div className="text-sm text-gray-700">
                {selectedMessage.message_type === 'email' && selectedMessage.subject && (
                  <div className="mb-2">
                    <span className="font-medium text-gray-600">Subject: </span>
                    {selectedMessage.subject}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{selectedMessage.content}</div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !messageId}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
