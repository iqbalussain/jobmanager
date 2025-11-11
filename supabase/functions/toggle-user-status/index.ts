import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify the requesting user is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin using secure has_role function
    const { data: isAdmin, error: roleError } = await supabaseAdmin
      .rpc('has_role', { 
        _user_id: user.id, 
        _role: 'admin' 
      });

    if (roleError || !isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    const { userId, isActive } = await req.json();

    if (!userId || typeof isActive !== 'boolean') {
      throw new Error('Missing required fields');
    }

    // Update user status in profiles table
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId);

    if (updateError) throw updateError;

    // If deactivating, sign out all sessions for that user
    if (!isActive) {
      await supabaseAdmin.auth.admin.signOut(userId);
    }

    // Log the activity
    await supabaseAdmin.from('activities').insert({
      user_id: user.id,
      action: isActive ? 'user_activated' : 'user_deactivated',
      description: `Admin ${isActive ? 'activated' : 'deactivated'} user ${userId}`,
      entity_type: 'user',
      entity_id: userId
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error toggling user status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
