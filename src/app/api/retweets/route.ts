import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { CURRENT_USER } from '@/lib/types';

// POST /api/retweets - Toggle retweet
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { tweetId, userId = CURRENT_USER.id } = body;

    // Check if already retweeted
    const { data: existingRetweet } = await client
      .from('retweets')
      .select('id')
      .eq('tweet_id', tweetId)
      .eq('user_id', userId)
      .single();

    if (existingRetweet) {
      // Remove retweet
      const { error: deleteError } = await client
        .from('retweets')
        .delete()
        .eq('id', existingRetweet.id);

      if (deleteError) {
        return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
      }

      // Decrement retweets_count
      client
        .from('tweets')
        .select('retweets_count')
        .eq('id', tweetId)
        .single()
        .then(({ data }) => {
          if (data) {
            client
              .from('tweets')
              .update({ retweets_count: Math.max(0, (data.retweets_count || 1) - 1) })
              .eq('id', tweetId);
          }
        });

      return NextResponse.json({ success: true, retweeted: false });
    } else {
      // Add retweet
      const { error: insertError } = await client
        .from('retweets')
        .insert({ tweet_id: tweetId, user_id: userId });

      if (insertError) {
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
      }

      // Increment retweets_count
      client
        .from('tweets')
        .select('retweets_count')
        .eq('id', tweetId)
        .single()
        .then(({ data }) => {
          if (data) {
            client
              .from('tweets')
              .update({ retweets_count: (data.retweets_count || 0) + 1 })
              .eq('id', tweetId);
          }
        });

      return NextResponse.json({ success: true, retweeted: true });
    }
  } catch (error) {
    console.error('Error toggling retweet:', error);
    return NextResponse.json({ success: false, error: 'Failed to toggle retweet' }, { status: 500 });
  }
}
