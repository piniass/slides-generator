import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * User Profile Info API Endpoint
 * 
 * POST /api/profile - Save or update user profile information
 * GET /api/profile - Get user profile information
 */

interface ProfileInfoData {
  core_idea?: string | null;
  pain_point?: string | null;
  audience_profile?: string[] | null;
  technical_level?: string | null;
  product_role?: string | null;
  intensity_level?: number;
  content_goal?: string | null;
  language?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to save your profile.' },
        { status: 401 }
      );
    }

    // Ensure user exists in public.users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingUser) {
      // User doesn't exist in public.users, create it
      const { error: createUserError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (createUserError) {
        console.error('Error creating user in public.users:', createUserError);
        return NextResponse.json(
          { error: 'Failed to initialize user profile. Please contact support.' },
          { status: 500 }
        );
      }
    }

    // Parse request body
    const body: ProfileInfoData = await request.json();

    // Validate intensity_level if provided
    if (body.intensity_level !== undefined && (body.intensity_level < 1 || body.intensity_level > 5)) {
      return NextResponse.json(
        { error: 'intensity_level must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Prepare data for upsert
    const profileData = {
      user_id: user.id,
      core_idea: body.core_idea || null,
      pain_point: body.pain_point || null,
      audience_profile: body.audience_profile && body.audience_profile.length > 0 
        ? body.audience_profile 
        : null,
      technical_level: body.technical_level || null,
      product_role: body.product_role || null,
      intensity_level: body.intensity_level || 3,
      content_goal: body.content_goal || null,
      language: body.language || 'English',
      updated_at: new Date().toISOString(),
    };

    // Upsert profile (insert or update)
    const { data, error } = await supabase
      .from('user_profile_info')
      .upsert(profileData, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving profile:', error);
      return NextResponse.json(
        { error: 'Failed to save profile. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile saved successfully',
      data
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error saving profile:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to view your profile.' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data, error } = await supabase
      .from('user_profile_info')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no profile exists, return null instead of error
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          data: null,
          message: 'No profile found'
        }, { status: 200 });
      }

      console.error('Error fetching profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

