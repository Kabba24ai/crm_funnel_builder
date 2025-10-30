export type Database = {
  public: {
    Tables: {
      sales_funnels: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      funnel_steps: {
        Row: {
          id: string;
          funnel_id: string;
          step_number: number;
          message_id: string;
          message_type: 'sms' | 'email';
          delay_days: number;
          trigger_condition: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          funnel_id: string;
          step_number: number;
          message_id: string;
          message_type: 'sms' | 'email';
          delay_days?: number;
          trigger_condition?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          funnel_id?: string;
          step_number?: number;
          message_id?: string;
          message_type?: 'sms' | 'email';
          delay_days?: number;
          trigger_condition?: string;
          created_at?: string;
        };
      };
      customer_funnel_enrollments: {
        Row: {
          id: string;
          customer_id: string;
          rental_id: string | null;
          funnel_id: string;
          enrolled_at: string;
          status: 'active' | 'completed' | 'paused' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          rental_id?: string | null;
          funnel_id: string;
          enrolled_at?: string;
          status?: 'active' | 'completed' | 'paused' | 'cancelled';
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          rental_id?: string | null;
          funnel_id?: string;
          enrolled_at?: string;
          status?: 'active' | 'completed' | 'paused' | 'cancelled';
          created_at?: string;
        };
      };
      funnel_step_executions: {
        Row: {
          id: string;
          enrollment_id: string;
          funnel_step_id: string;
          scheduled_date: string;
          executed_date: string | null;
          status: 'pending' | 'sent' | 'failed' | 'skipped';
          created_at: string;
        };
        Insert: {
          id?: string;
          enrollment_id: string;
          funnel_step_id: string;
          scheduled_date: string;
          executed_date?: string | null;
          status?: 'pending' | 'sent' | 'failed' | 'skipped';
          created_at?: string;
        };
        Update: {
          id?: string;
          enrollment_id?: string;
          funnel_step_id?: string;
          scheduled_date?: string;
          executed_date?: string | null;
          status?: 'pending' | 'sent' | 'failed' | 'skipped';
          created_at?: string;
        };
      };
      text_messages: {
        Row: {
          id: string;
          message_type: string;
          context_category: string;
          content_name: string;
          content: string;
          created_at: string;
        };
      };
      email_messages: {
        Row: {
          id: string;
          message_type: string;
          context_category: string;
          content_name: string;
          subject: string;
          content: string;
          created_at: string;
        };
      };
      customers: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          created_at: string;
        };
      };
      rentals: {
        Row: {
          id: string;
          customer_id: string;
          status: string;
          start_date: string;
          end_date: string;
          created_at: string;
        };
      };
    };
  };
};
