import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { CURRENT_USER } from '@/lib/types';

// GET /api/users/[username] - Get user by username
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { username } = await params;

    const { data: user, error } = await client
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Check if current user is following this user
    const { data: follow } = await client
      .from('follows')
      .select('id')
      .eq('follower_id', CURRENT_USER.id)
      .eq('following_id', user.id)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        user,
        isFollowing: !!follow,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}
