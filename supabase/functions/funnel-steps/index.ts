import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const url = new URL(req.url);
    const method = req.method;

    if (method === 'GET') {
      const funnelId = url.searchParams.get('funnel_id');
      
      if (!funnelId) throw new Error('Missing funnel ID');

      const { data, error } = await supabase
        .from('funnel_steps')
        .select(`
          *,
          message_templates (
            name,
            content,
            subject
          )
        `)
        .eq('funnel_id', funnelId)
        .order('step_number', { ascending: true });

      if (error) throw error;

      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'POST') {
      const body = await req.json();
      
      if (Array.isArray(body)) {
        const { data, error } = await supabase
          .from('funnel_steps')
          .insert(body)
          .select();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const { data, error } = await supabase
        .from('funnel_steps')
        .insert(body)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'PUT') {
      const body = await req.json();
      const id = url.searchParams.get('id');
      
      if (!id) throw new Error('Missing step ID');

      const { data, error } = await supabase
        .from('funnel_steps')
        .update(body)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'DELETE') {
      const id = url.searchParams.get('id');
      
      if (!id) throw new Error('Missing step ID');

      const { error } = await supabase
        .from('funnel_steps')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
