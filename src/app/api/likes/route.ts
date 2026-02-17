import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { CURRENT_USER } from '@/lib/types';

// Helper function to update likes count
async function updateLikesCount(client: ReturnType<typeof getSupabaseClient>, tweetId: string, increment: boolean) {
  const { data: tweet } = await client
    .from('tweets')
    .select('likes_count')
    .eq('id', tweetId)
    .single();

  if (tweet) {
    const newCount = increment
      ? (tweet.likes_count || 0) + 1
      : Math.max(0, (tweet.likes_count || 1) - 1);

    await client
      .from('tweets')
      .update({ likes_count: newCount })
      .eq('id', tweetId);
  }
}

// POST /api/likes - Toggle like
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { tweetId, userId = CURRENT_USER.id } = body;

    // Check if already liked
    const { data: existingLike } = await client
      .from('likes')
      .select('id')
      .eq('tweet_id', tweetId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike: delete the like and decrement count
      const { error: deleteError } = await client
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
      }

      // Decrement likes_count
      await updateLikesCount(client, tweetId, false);

      return NextResponse.json({ success: true, liked: false });
    } else {
      // Like: create new like and increment count
      const { error: insertError } = await client
        .from('likes')
        .insert({ tweet_id: tweetId, user_id: userId });

      if (insertError) {
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
      }

      // Increment likes_count
      await updateLikesCount(client, tweetId, true);

      return NextResponse.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ success: false, error: 'Failed to toggle like' }, { status: 500 });
  }
}
