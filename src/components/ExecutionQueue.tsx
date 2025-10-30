import React, { useState, useEffect } from 'react';
import { Send, SkipForward, XIcon, Mail, MessageSquare, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { StepExecution } from '../types/funnel';

const ExecutionQueue: React.FC = () => {
  const [executions, setExecutions] = useState<StepExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExecutions();
    const interval = setInterval(loadExecutions, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadExecutions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('funnel_step_executions')
        .select(`
          *,
          customer_funnel_enrollments (
            customers (first_name, last_name),
            sales_funnels (name)
          ),
          funnel_steps (step_number, message_type)
        `)
        .eq('status', 'pending')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      const enriched = (data || []).map((execution: any) => ({
        ...execution,
        customer_name: `${execution.customer_funnel_enrollments?.customers?.first_name || ''} ${
          execution.customer_funnel_enrollments?.customers?.last_name || ''
        }`.trim(),
        funnel_name: execution.customer_funnel_enrollments?.sales_funnels?.name || 'Unknown',
        step_number: execution.funnel_steps?.step_number,
        message_type: execution.funnel_steps?.message_type,
      }));

      setExecutions(enriched);
    } catch (error) {
      console.error('Error loading executions:', error);
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
      loadExecutions();
    } catch (error) {
      console.error('Error updating execution:', error);
    }
  };

  const sendAllDue = async () => {
    const now = new Date();
    const dueExecutions = executions.filter(
      (exec) => new Date(exec.scheduled_date) <= now
    );

    if (dueExecutions.length === 0) {
      alert('No messages are due to be sent right now.');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to send ${dueExecutions.length} message(s) that are due now?`
      )
    ) {
      return;
    }

    try {
      const updates = dueExecutions.map((exec) =>
        supabase
          .from('funnel_step_executions')
          .update({
            status: 'sent',
            executed_date: new Date().toISOString(),
          })
          .eq('id', exec.id)
      );

      await Promise.all(updates);
      loadExecutions();
    } catch (error) {
      console.error('Error sending messages:', error);
    }
  };

  const getTimeUntil = (scheduledDate: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledDate);
    const diffMs = scheduled.getTime() - now.getTime();

    if (diffMs <= 0) {
      return 'Due now';
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m`;
    }
  };

  const isDue = (scheduledDate: string) => {
    return new Date(scheduledDate) <= new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading execution queue...</div>
      </div>
    );
  }

  const dueCount = executions.filter((exec) => isDue(exec.scheduled_date)).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Execution Queue</h2>
          <p className="text-sm text-gray-600 mt-1">
            {executions.length} pending {executions.length === 1 ? 'message' : 'messages'}
            {dueCount > 0 && (
              <span className="text-orange-600 font-medium"> • {dueCount} due now</span>
            )}
          </p>
        </div>
        {dueCount > 0 && (
          <button
            onClick={sendAllDue}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Send size={20} />
            Send All Due Now ({dueCount})
          </button>
        )}
      </div>

      {executions.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <Clock size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending messages</h3>
          <p className="text-gray-500">The execution queue is empty</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funnel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Step
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Until
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {executions.map((execution) => {
                  const timeUntil = getTimeUntil(execution.scheduled_date);
                  const isOverdue = isDue(execution.scheduled_date);

                  return (
                    <tr
                      key={execution.id}
                      className={`hover:bg-gray-50 ${isOverdue ? 'bg-orange-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {execution.customer_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{execution.funnel_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Step {execution.step_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {execution.message_type === 'email' ? (
                            <Mail size={16} className="text-blue-600" />
                          ) : (
                            <MessageSquare size={16} className="text-blue-600" />
                          )}
                          <span className="text-sm text-gray-600">
                            {execution.message_type?.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(execution.scheduled_date).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-medium ${
                            isOverdue ? 'text-orange-600' : 'text-gray-600'
                          }`}
                        >
                          {timeUntil}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => updateExecutionStatus(execution.id, 'sent', true)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Send Now"
                          >
                            <Send size={18} />
                          </button>
                          <button
                            onClick={() => updateExecutionStatus(execution.id, 'skipped')}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Skip"
                          >
                            <SkipForward size={18} />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  'Are you sure you want to cancel this scheduled message?'
                                )
                              ) {
                                supabase
                                  .from('funnel_step_executions')
                                  .delete()
                                  .eq('id', execution.id)
                                  .then(() => loadExecutions());
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <XIcon size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionQueue;
