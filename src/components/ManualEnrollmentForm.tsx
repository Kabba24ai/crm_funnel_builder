import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Customer, SalesFunnel, FunnelStep } from '../types/funnel';

interface ManualEnrollmentFormProps {
  onClose: () => void;
  onSave: () => void;
}

const ManualEnrollmentForm: React.FC<ManualEnrollmentFormProps> = ({ onClose, onSave }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [funnels, setFunnels] = useState<SalesFunnel[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [funnelId, setFunnelId] = useState('');
  const [rentalId, setRentalId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [customersRes, funnelsRes] = await Promise.all([
        supabase
          .from('customers')
          .select('*')
          .order('last_name', { ascending: true }),
        supabase
          .from('sales_funnels')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true }),
      ]);

      if (customersRes.error) throw customersRes.error;
      if (funnelsRes.error) throw funnelsRes.error;

      setCustomers(customersRes.data || []);
      setFunnels(funnelsRes.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load customers and funnels');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('customer_funnel_enrollments')
        .insert({
          customer_id: customerId,
          funnel_id: funnelId,
          rental_id: rentalId || null,
          enrolled_at: new Date().toISOString(),
          status: 'active',
        })
        .select()
        .single();

      if (enrollmentError) throw enrollmentError;

      const { data: steps, error: stepsError } = await supabase
        .from('funnel_steps')
        .select('*')
        .eq('funnel_id', funnelId)
        .order('step_number', { ascending: true });

      if (stepsError) throw stepsError;

      const enrolledAt = new Date(enrollment.enrolled_at);
      const executions = steps.map((step: FunnelStep) => {
        const scheduledDate = new Date(enrolledAt);
        scheduledDate.setDate(scheduledDate.getDate() + step.delay_days);

        return {
          enrollment_id: enrollment.id,
          funnel_step_id: step.id,
          scheduled_date: scheduledDate.toISOString(),
          status: 'pending',
        };
      });

      if (executions.length > 0) {
        const { error: executionsError } = await supabase
          .from('funnel_step_executions')
          .insert(executions);

        if (executionsError) throw executionsError;
      }

      onSave();
    } catch (err) {
      console.error('Error creating enrollment:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Manual Enrollment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a customer...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name} - {customer.email}
                  </option>
                ))}
              </select>
              {customers.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">No customers found</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Funnel <span className="text-red-500">*</span>
              </label>
              <select
                value={funnelId}
                onChange={(e) => setFunnelId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a funnel...</option>
                {funnels.map((funnel) => (
                  <option key={funnel.id} value={funnel.id}>
                    {funnel.name}
                  </option>
                ))}
              </select>
              {funnels.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No active funnels found. Please create and activate a funnel first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rental Reference (Optional)
              </label>
              <input
                type="text"
                value={rentalId}
                onChange={(e) => setRentalId(e.target.value)}
                placeholder="Enter rental ID if applicable"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Link this enrollment to a specific rental
              </p>
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
                disabled={saving || !customerId || !funnelId || funnels.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Enrolling...' : 'Enroll Customer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ManualEnrollmentForm;
