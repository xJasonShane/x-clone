import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { CURRENT_USER } from '@/lib/types';

// GET /api/bookmarks - Get user's bookmarked tweets
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // Get bookmarked tweet IDs
    const { data: bookmarks, error: bookmarkError } = await client
      .from('bookmarks')
      .select('tweet_id')
      .eq('user_id', CURRENT_USER.id);

    if (bookmarkError) {
      return NextResponse.json({ success: false, error: bookmarkError.message }, { status: 500 });
    }

    if (!bookmarks || bookmarks.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const tweetIds = bookmarks.map(b => b.tweet_id);

    // Get tweets with authors
    const { data: tweets, error: tweetsError } = await client
      .from('tweets')
      .select(`
        *,
        author:users!tweets_author_id_fkey (
          id,
          username,
          display_name,
          avatar
        )
      `)
      .in('id', tweetIds)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (tweetsError) {
      return NextResponse.json({ success: false, error: tweetsError.message }, { status: 500 });
    }

    // Get interaction status
    const tweetList = tweets.map((tweet: Record<string, unknown>) => ({
      ...tweet,
      is_liked: false,
      is_bookmarked: true,
      is_retweeted: false,
    }));

    return NextResponse.json({ success: true, data: tweetList });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

// POST /api/bookmarks - Toggle bookmark
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { tweetId } = body;

    // Check if already bookmarked
    const { data: existing } = await client
      .from('bookmarks')
      .select('id')
      .eq('user_id', CURRENT_USER.id)
      .eq('tweet_id', tweetId)
      .single();

    if (existing) {
      // Remove bookmark
      const { error } = await client
        .from('bookmarks')
        .delete()
        .eq('id', existing.id);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      // Update bookmarks count
      await client.rpc('decrement_bookmarks_count', { tweet_id: tweetId });

      return NextResponse.json({ success: true, bookmarked: false });
    } else {
      // Add bookmark
      const { error } = await client
        .from('bookmarks')
        .insert({
          user_id: CURRENT_USER.id,
          tweet_id: tweetId,
        });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      // Update bookmarks count
      await client.rpc('increment_bookmarks_count', { tweet_id: tweetId });

      return NextResponse.json({ success: true, bookmarked: true });
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json({ success: false, error: 'Failed to toggle bookmark' }, { status: 500 });
  }
}
