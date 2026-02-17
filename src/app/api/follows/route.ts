import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { CURRENT_USER } from '@/lib/types';

// POST /api/follows - Toggle follow
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { targetUserId, userId = CURRENT_USER.id } = body;

    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'Target user ID is required' }, { status: 400 });
    }

    if (targetUserId === userId) {
      return NextResponse.json({ success: false, error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    const { data: existingFollow } = await client
      .from('follows')
      .select('id')
      .eq('follower_id', userId)
      .eq('following_id', targetUserId)
      .single();

    if (existingFollow) {
      // Unfollow
      const { error: deleteError } = await client
        .from('follows')
        .delete()
        .eq('id', existingFollow.id);

      if (deleteError) {
        return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
      }

      // Update counts
      await client
        .from('users')
        .select('following_count')
        .eq('id', userId)
        .single()
        .then(({ data }) => {
          if (data) {
            client
              .from('users')
              .update({ following_count: Math.max(0, (data.following_count || 1) - 1) })
              .eq('id', userId);
          }
        });

      await client
        .from('users')
        .select('followers_count')
        .eq('id', targetUserId)
        .single()
        .then(({ data }) => {
          if (data) {
            client
              .from('users')
              .update({ followers_count: Math.max(0, (data.followers_count || 1) - 1) })
              .eq('id', targetUserId);
          }
        });

      return NextResponse.json({ success: true, following: false });
    } else {
      // Follow
      const { error: insertError } = await client
        .from('follows')
        .insert({ follower_id: userId, following_id: targetUserId });

      if (insertError) {
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
      }

      // Update counts
      await client
        .from('users')
        .select('following_count')
        .eq('id', userId)
        .single()
        .then(({ data }) => {
          if (data) {
            client
              .from('users')
              .update({ following_count: (data.following_count || 0) + 1 })
              .eq('id', userId);
          }
        });

      await client
        .from('users')
        .select('followers_count')
        .eq('id', targetUserId)
        .single()
        .then(({ data }) => {
          if (data) {
            client
              .from('users')
              .update({ followers_count: (data.followers_count || 0) + 1 })
              .eq('id', targetUserId);
          }
        });

      return NextResponse.json({ success: true, following: true });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return NextResponse.json({ success: false, error: 'Failed to toggle follow' }, { status: 500 });
  }
}
