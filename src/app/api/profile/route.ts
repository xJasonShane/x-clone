import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { CURRENT_USER } from '@/lib/types';

// PATCH /api/profile - Update current user profile
export async function PATCH(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { username, display_name, bio, avatar, cover_image } = body;

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    
    // Handle username update
    if (username !== undefined) {
      if (!username || username.trim().length === 0) {
        return NextResponse.json({ success: false, error: 'Username cannot be empty' }, { status: 400 });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return NextResponse.json({ success: false, error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 });
      }
      // Check if username is already taken
      const { data: existingUser } = await client
        .from('users')
        .select('id')
        .eq('username', username.trim())
        .neq('id', CURRENT_USER.id)
        .maybeSingle();
      
      if (existingUser) {
        return NextResponse.json({ success: false, error: 'Username is already taken' }, { status: 400 });
      }
      updateData.username = username.trim();
    }
    
    if (display_name !== undefined) updateData.display_name = display_name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (cover_image !== undefined) updateData.cover_image = cover_image;

    const { data: user, error } = await client
      .from('users')
      .update(updateData)
      .eq('id', CURRENT_USER.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { user } });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
