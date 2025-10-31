export interface SalesFunnel {
  id: string;
  name: string;
  description: string | null;
  trigger_condition: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  step_count?: number;
}

export interface FunnelStep {
  id: string;
  funnel_id: string;
  step_number: number;
  message_id: string;
  message_type: 'sms' | 'email';
  delay_days: number;
  delay_value: number;
  delay_unit: 'minutes' | 'hours' | 'days';
  created_at: string;
}

export interface CustomerEnrollment {
  id: string;
  customer_id: string;
  rental_id: string | null;
  funnel_id: string;
  enrolled_at: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  customer_name?: string;
  funnel_name?: string;
  progress?: { current: number; total: number };
}

export interface StepExecution {
  id: string;
  enrollment_id: string;
  funnel_step_id: string;
  scheduled_date: string;
  executed_date: string | null;
  status: 'pending' | 'sent' | 'failed' | 'skipped';
  created_at: string;
  customer_name?: string;
  funnel_name?: string;
  step_number?: number;
  message_type?: 'sms' | 'email';
}

export interface MessageTemplate {
  id: string;
  name: string;
  message_type: 'sms' | 'email';
  subject: string | null;
  body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
}

export type TriggerCondition =
  | 'rental_created'
  | 'rental_active'
  | 'before_return'
  | 'after_return'
  | 'custom';
