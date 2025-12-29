import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[HA Proxy] No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with the user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('[HA Proxy] User auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[HA Proxy] Authenticated user: ${user.id}`);

    // Get user's HA config from database
    const { data: haConfig, error: configError } = await supabaseClient
      .from('user_ha_configs')
      .select('base_url, access_token')
      .eq('user_id', user.id)
      .single();

    if (configError || !haConfig) {
      console.error('[HA Proxy] No HA config found:', configError);
      return new Response(
        JSON.stringify({ error: 'Home Assistant not configured', code: 'HA_NOT_CONFIGURED' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body
    const body = await req.json();
    const { path, method = 'GET', data } = body;

    if (!path) {
      return new Response(
        JSON.stringify({ error: 'Missing path parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct the HA API URL
    const haUrl = `${haConfig.base_url}${path}`;
    console.log(`[HA Proxy] Proxying ${method} request to: ${haUrl}`);

    // Make the request to Home Assistant with retry logic
    let haResponse: Response;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        haResponse = await fetch(haUrl, {
          method,
          headers: {
            'Authorization': `Bearer ${haConfig.access_token}`,
            'Content-Type': 'application/json',
          },
          body: data ? JSON.stringify(data) : undefined,
        });
        lastError = null;
        break;
      } catch (fetchError) {
        lastError = fetchError as Error;
        console.error(`[HA Proxy] Fetch attempt ${attempt + 1} failed:`, fetchError);
        if (attempt < 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    if (lastError) {
      return new Response(
        JSON.stringify({ error: lastError.message, code: 'HA_CONNECTION_ERROR' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle image responses
    const contentType = haResponse!.headers.get('content-type') || '';
    if (contentType.startsWith('image/')) {
      const imageBuffer = await haResponse!.arrayBuffer();
      return new Response(imageBuffer, {
        status: haResponse!.status,
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
        },
      });
    }

    // Handle empty responses
    const responseText = await haResponse!.text();
    if (!responseText || responseText.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Empty response from Home Assistant', code: 'HA_EMPTY_RESPONSE' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to parse JSON response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[HA Proxy] Failed to parse response:', responseText.substring(0, 200));
      return new Response(
        JSON.stringify({ error: 'Invalid JSON response from Home Assistant', raw: responseText.substring(0, 100) }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(responseData),
      {
        status: haResponse!.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[HA Proxy] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
