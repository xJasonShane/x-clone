import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { CURRENT_USER } from '@/lib/types';

// GET /api/user - Get current user info
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || CURRENT_USER.id;

    const { data: user, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // If user doesn't exist, create one
      if (error.code === 'PGRST116') {
        const { data: newUser, error: createError } = await client
          .from('users')
          .insert({
            id: CURRENT_USER.id,
            username: CURRENT_USER.username,
            display_name: CURRENT_USER.display_name,
            email: CURRENT_USER.email,
            bio: CURRENT_USER.bio,
          })
          .select()
          .single();

        if (createError) {
          return NextResponse.json({ success: false, error: createError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: newUser });
      }

      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH /api/user - Update user info
export async function PATCH(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { userId = CURRENT_USER.id, ...updates } = body;

    // Filter allowed fields
    const allowedFields = ['username', 'display_name', 'bio', 'avatar', 'cover_image'];
    const filteredUpdates: Record<string, string> = {};

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }

    // Check if username is taken (if updating username)
    if (filteredUpdates.username) {
      const { data: existingUser } = await client
        .from('users')
        .select('id')
        .eq('username', filteredUpdates.username)
        .neq('id', userId)
        .single();

      if (existingUser) {
        return NextResponse.json({ success: false, error: 'Username is already taken' }, { status: 400 });
      }
    }

    const { data: user, error } = await client
      .from('users')
      .update({
        ...filteredUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}
