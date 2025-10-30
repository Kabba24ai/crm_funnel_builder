import React from 'react';
import { Plus, Mail, MessageSquare, Edit2, Trash2, Clock } from 'lucide-react';
import type { FunnelStep } from '../types/funnel';

interface FunnelTimelineProps {
  steps: FunnelStep[];
  onAddStep: () => void;
  onEditStep: (step: FunnelStep) => void;
  onDeleteStep: (stepId: string) => void;
}

const FunnelTimeline: React.FC<FunnelTimelineProps> = ({
  steps,
  onAddStep,
  onEditStep,
  onDeleteStep,
}) => {
  if (steps.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-3">
          <Plus size={32} className="mx-auto" />
        </div>
        <p className="text-gray-600 mb-4">No steps added yet</p>
        <button
          onClick={onAddStep}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add First Step
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-700">Funnel Steps</h4>
        <button
          onClick={onAddStep}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Step
        </button>
      </div>

      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {index > 0 && (
              <div className="absolute left-6 -top-4 w-0.5 h-4 bg-gray-300" />
            )}

            <div className="flex items-start gap-4 bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  {step.message_type === 'email' ? (
                    <Mail size={20} className="text-blue-600" />
                  ) : (
                    <MessageSquare size={20} className="text-blue-600" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        Step {step.step_number}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {step.message_type.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Clock size={14} />
                      <span>
                        {step.delay_days === 0
                          ? 'Immediate'
                          : `${step.delay_days} ${step.delay_days === 1 ? 'day' : 'days'} after ${
                              step.trigger_condition.replace(/_/g, ' ')
                            }`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Trigger: {step.trigger_condition.replace(/_/g, ' ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditStep(step)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteStep(step.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className="absolute left-6 bottom-0 w-0.5 h-4 bg-gray-300" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FunnelTimeline;
