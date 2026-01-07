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

    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      throw new Error('Missing required fields');
    }

    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Update user password using admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) throw updateError;

    // Log the activity
    await supabaseAdmin.from('activities').insert({
      user_id: user.id,
      action: 'password_reset',
      description: `Admin reset password for user ${userId}`,
      entity_type: 'user',
      entity_id: userId
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Password reset successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error resetting password:', error);
    // Map errors to safe user messages
    let safeMessage = 'An error occurred. Please try again.';
    let statusCode = 400;
    
    if (error.message?.includes('Unauthorized') || error.message?.includes('authorization')) {
      safeMessage = 'You do not have permission to perform this action.';
      statusCode = 401;
    } else if (error.message?.includes('Admin access required')) {
      safeMessage = 'Admin access is required for this action.';
      statusCode = 403;
    } else if (error.message?.includes('Missing required')) {
      safeMessage = 'Please provide all required fields.';
    } else if (error.message?.includes('Password must be')) {
      safeMessage = 'Password must be at least 8 characters.';
    }
    
    return new Response(
      JSON.stringify({ error: safeMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: statusCode }
    );
  }
});
