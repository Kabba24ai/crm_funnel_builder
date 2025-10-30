import React, { useState, useEffect } from 'react';
import { X, Mail, MessageSquare, CheckCircle, Clock, AlertCircle, SkipForward, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { CustomerEnrollment, StepExecution, FunnelStep } from '../types/funnel';

interface EnrollmentDetailModalProps {
  enrollmentId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const EnrollmentDetailModal: React.FC<EnrollmentDetailModalProps> = ({
  enrollmentId,
  onClose,
  onUpdate,
}) => {
  const [enrollment, setEnrollment] = useState<CustomerEnrollment | null>(null);
  const [executions, setExecutions] = useState<(StepExecution & { funnel_steps?: FunnelStep })[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [enrollmentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('customer_funnel_enrollments')
        .select(`
          *,
          customers (first_name, last_name, email, phone),
          sales_funnels (name, description),
          rentals (status, start_date, end_date)
        `)
        .eq('id', enrollmentId)
        .single();

      if (enrollmentError) throw enrollmentError;

      const enrichedEnrollment = {
        ...enrollmentData,
        customer_name: `${enrollmentData.customers?.first_name || ''} ${
          enrollmentData.customers?.last_name || ''
        }`.trim(),
        funnel_name: enrollmentData.sales_funnels?.name || 'Unknown',
      };

      setEnrollment(enrichedEnrollment);

      const { data: executionsData, error: executionsError } = await supabase
        .from('funnel_step_executions')
        .select(`
          *,
          funnel_steps (step_number, message_type, message_id, delay_days, trigger_condition)
        `)
        .eq('enrollment_id', enrollmentId)
        .order('scheduled_date', { ascending: true });

      if (executionsError) throw executionsError;
      setExecutions(executionsData || []);
    } catch (error) {
      console.error('Error loading enrollment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateExecutionStatus = async (
    executionId: string,
    status: 'sent' | 'skipped',
    executeNow: boolean = false
  ) => {
    try {
      const updateData: any = { status };
      if (executeNow || status === 'sent') {
        updateData.executed_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('funnel_step_executions')
        .update(updateData)
        .eq('id', executionId);

      if (error) throw error;
      loadData();
      onUpdate();
    } catch (error) {
      console.error('Error updating execution:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'pending':
        return <Clock size={20} className="text-gray-600" />;
      case 'failed':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'skipped':
        return <SkipForward size={20} className="text-yellow-600" />;
      default:
        return <Clock size={20} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'skipped':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-8">
          <div className="text-center text-gray-500">Loading enrollment details...</div>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">Enrollment Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Customer Information</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Name</span>
                  <p className="text-sm font-medium text-gray-900">{enrollment.customer_name}</p>
                </div>
                {(enrollment as any).customers?.email && (
                  <div>
                    <span className="text-xs text-gray-500">Email</span>
                    <p className="text-sm text-gray-900">{(enrollment as any).customers.email}</p>
                  </div>
                )}
                {(enrollment as any).customers?.phone && (
                  <div>
                    <span className="text-xs text-gray-500">Phone</span>
                    <p className="text-sm text-gray-900">{(enrollment as any).customers.phone}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Funnel Information</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Funnel</span>
                  <p className="text-sm font-medium text-gray-900">{enrollment.funnel_name}</p>
                </div>
                {(enrollment as any).sales_funnels?.description && (
                  <div>
                    <span className="text-xs text-gray-500">Description</span>
                    <p className="text-sm text-gray-900">
                      {(enrollment as any).sales_funnels.description}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500">Enrolled</span>
                  <p className="text-sm text-gray-900">
                    {new Date(enrollment.enrolled_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Status</span>
                  <p>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        enrollment.status
                      )}`}
                    >
                      {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {(enrollment as any).rentals && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Rental Information</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-gray-500">Status</span>
                  <p className="text-sm text-gray-900">{(enrollment as any).rentals.status}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Start Date</span>
                  <p className="text-sm text-gray-900">
                    {new Date((enrollment as any).rentals.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">End Date</span>
                  <p className="text-sm text-gray-900">
                    {new Date((enrollment as any).rentals.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Execution Timeline</h4>
            <div className="space-y-3">
              {executions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No steps scheduled yet</div>
              ) : (
                executions.map((execution, index) => (
                  <div
                    key={execution.id}
                    className="relative bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    {index > 0 && (
                      <div className="absolute left-6 -top-3 w-0.5 h-3 bg-gray-300" />
                    )}

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">{getStatusIcon(execution.status)}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-900">
                                Step {execution.funnel_steps?.step_number || '?'}
                              </span>
                              {execution.funnel_steps?.message_type === 'email' ? (
                                <Mail size={16} className="text-blue-600" />
                              ) : (
                                <MessageSquare size={16} className="text-blue-600" />
                              )}
                              <span className="text-xs text-gray-500">
                                {execution.funnel_steps?.message_type?.toUpperCase()}
                              </span>
                            </div>
                            <span
                              className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                                execution.status
                              )}`}
                            >
                              {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
                            </span>
                          </div>

                          {execution.status === 'pending' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => updateExecutionStatus(execution.id, 'sent', true)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Send Now"
                              >
                                <Send size={16} />
                              </button>
                              <button
                                onClick={() => updateExecutionStatus(execution.id, 'skipped')}
                                className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                                title="Skip"
                              >
                                <SkipForward size={16} />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-xs text-gray-500">Scheduled</span>
                            <p className="text-gray-900">
                              {new Date(execution.scheduled_date).toLocaleString()}
                            </p>
                          </div>
                          {execution.executed_date && (
                            <div>
                              <span className="text-xs text-gray-500">Executed</span>
                              <p className="text-gray-900">
                                {new Date(execution.executed_date).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>

                        {execution.funnel_steps?.trigger_condition && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">
                              Trigger: {execution.funnel_steps.trigger_condition.replace(/_/g, ' ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDetailModal;
