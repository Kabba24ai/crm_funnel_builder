import React, { useState } from 'react';
import { Plus, Mail, MessageSquare, Edit2, Trash2, Clock, Zap, Calendar, ArrowRight, GripVertical } from 'lucide-react';
import type { FunnelStep } from '../types/funnel';
import { supabase } from '../lib/supabase';

interface FunnelTimelineProps {
  steps: FunnelStep[];
  triggerCondition: string;
  triggerDelayValue: number;
  triggerDelayUnit: 'minutes' | 'hours' | 'days';
  onAddStep: () => void;
  onEditStep: (step: FunnelStep) => void;
  onDeleteStep: (stepId: string) => void;
  onReorder: () => void;
}

const FunnelTimeline: React.FC<FunnelTimelineProps> = ({
  steps,
  triggerCondition,
  triggerDelayValue,
  triggerDelayUnit,
  onAddStep,
  onEditStep,
  onDeleteStep,
  onReorder,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      rental_created: 'Rental Created',
      rental_active: 'Rental Active',
      before_return: 'Before Return',
      after_return: 'After Return',
      custom: 'Custom',
    };
    return labels[trigger] || trigger.replace(/_/g, ' ');
  };

  const getTriggerColor = (trigger: string) => {
    const colors: Record<string, string> = {
      rental_created: 'bg-blue-100 text-blue-700 border-blue-200',
      rental_active: 'bg-green-100 text-green-700 border-green-200',
      before_return: 'bg-orange-100 text-orange-700 border-orange-200',
      after_return: 'bg-purple-100 text-purple-700 border-purple-200',
      custom: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[trigger] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatDelay = (step: FunnelStep) => {
    const { delay_value, delay_unit } = step;

    if (delay_value === 0) {
      return 'Immediate';
    }

    const unitLabel = delay_value === 1
      ? delay_unit.slice(0, -1)
      : delay_unit;

    return `${delay_value} ${unitLabel}`;
  };

  const calculateCumulativeTime = (steps: FunnelStep[], upToIndex: number) => {
    const step = steps[upToIndex];
    let totalMinutes = 0;

    switch (step.delay_unit) {
      case 'minutes':
        totalMinutes = step.delay_value;
        break;
      case 'hours':
        totalMinutes = step.delay_value * 60;
        break;
      case 'days':
        totalMinutes = step.delay_value * 1440;
        break;
    }

    if (totalMinutes === 0) return 'At start';
    if (totalMinutes < 60) return `+${totalMinutes}m`;
    if (totalMinutes < 1440) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return mins > 0 ? `+${hours}h ${mins}m` : `+${hours}h`;
    }

    const days = Math.floor(totalMinutes / 1440);
    const remainingHours = Math.floor((totalMinutes % 1440) / 60);
    if (remainingHours > 0) {
      return `+${days}d ${remainingHours}h`;
    }
    return `+${days}d`;
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reorderedSteps = [...steps];
    const [draggedStep] = reorderedSteps.splice(draggedIndex, 1);
    reorderedSteps.splice(dropIndex, 0, draggedStep);

    try {
      const updates = reorderedSteps.map((step, index) => ({
        id: step.id,
        step_number: index + 1,
      }));

      for (const update of updates) {
        await supabase
          .from('funnel_steps')
          .update({ step_number: update.step_number })
          .eq('id', update.id);
      }

      onReorder();
    } catch (error) {
      console.error('Error reordering steps:', error);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (steps.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Plus size={48} className="mx-auto" />
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">Build Your Sales Funnel</h4>
        <p className="text-gray-600 mb-6">Add steps to create an automated sequence of messages</p>
        <button
          onClick={onAddStep}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Add First Step
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-semibold text-gray-900">Funnel Timeline</h4>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-xs font-medium ${getTriggerColor(triggerCondition)}`}>
              <Zap size={12} />
              <span>Event: {getTriggerLabel(triggerCondition)}</span>
            </div>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-xs text-gray-600">
              Starts {triggerDelayValue === 0
                ? 'at event'
                : `${Math.abs(triggerDelayValue)} ${triggerDelayUnit} ${triggerDelayValue < 0 ? 'before' : 'after'}`
              }
            </span>
            <span className="text-sm text-gray-400">•</span>
            <p className="text-sm text-gray-600">
              {steps.length} {steps.length === 1 ? 'step' : 'steps'}
            </p>
          </div>
        </div>
        <button
          onClick={onAddStep}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={18} />
          Add Step
        </button>
      </div>

      <div className="relative pl-8">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-blue-300 to-blue-200" />

        {steps.map((step, index) => {
          const cumulativeTime = calculateCumulativeTime(steps, index);
          const isFirstStep = index === 0;
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div key={step.id} className="relative mb-6 last:mb-0">
              {isFirstStep && (
                <div className="absolute -left-8 -top-2 flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-md z-10">
                  <Zap size={14} />
                  START
                </div>
              )}

              <div className="absolute left-[-2rem] top-6 w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-md flex items-center justify-center z-10">
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>

              <div
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={(e) => handleDragLeave(e)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`ml-6 bg-white border-2 rounded-xl shadow-sm hover:shadow-md transition-all cursor-move select-none ${
                  isDragging ? 'opacity-50 scale-95' : ''
                } ${
                  isDragOver ? 'border-blue-500 scale-105' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="p-5" draggable={false}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className="mt-1 text-gray-400 cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical size={20} />
                      </div>

                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        step.message_type === 'email'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : 'bg-gradient-to-br from-green-500 to-green-600'
                      } shadow-md`}>
                        {step.message_type === 'email' ? (
                          <Mail size={24} className="text-white" />
                        ) : (
                          <MessageSquare size={24} className="text-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                            {step.message_type.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100">
                              <Clock size={16} className="text-orange-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Delay</div>
                              <div className="font-semibold text-gray-900">
                                {formatDelay(step)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100">
                              <Calendar size={16} className="text-purple-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Total Time</div>
                              <div className="font-semibold text-gray-900">
                                {cumulativeTime}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0" draggable={false}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditStep(step);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => e.preventDefault()}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                        draggable={false}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteStep(step.id);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => e.preventDefault()}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                        draggable={false}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    {step.message_templates && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-semibold text-gray-700">Message:</span>
                          <span className="text-xs text-gray-600">{step.message_templates.name}</span>
                        </div>
                        {step.message_type === 'email' && step.message_templates.subject && (
                          <div className="text-xs text-gray-600 mb-1">
                            <span className="font-medium">Subject: </span>
                            {step.message_templates.subject}
                          </div>
                        )}
                        <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 line-clamp-2">
                          {step.message_templates.content}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      {step.delay_value === 0 ? (
                        <>Sends when funnel starts</>
                      ) : (
                        <>Sends {formatDelay(step).toLowerCase()} after funnel starts</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="ml-6 pl-6 py-4 flex items-center gap-2 text-gray-400">
                  <ArrowRight size={18} />
                  <span className="text-xs font-medium">Next step</span>
                </div>
              )}
            </div>
          );
        })}

        <div className="ml-6 pl-6 mt-4 flex items-center gap-2 px-4 py-3 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-white text-lg">✓</span>
          </div>
          <span className="text-sm font-semibold text-green-700">Funnel Complete</span>
        </div>
      </div>
    </div>
  );
};

export default FunnelTimeline;
