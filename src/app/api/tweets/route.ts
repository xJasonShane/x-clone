import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { CURRENT_USER } from '@/lib/types';

// GET /api/tweets - Fetch all tweets
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || CURRENT_USER.id;

    // Fetch tweets with author info
    const { data: tweets, error } = await client
      .from('tweets')
      .select(`
        id,
        content,
        author_id,
        images,
        likes_count,
        bookmarks_count,
        retweets_count,
        comments_count,
        quotes_count,
        views_count,
        is_pinned,
        is_deleted,
        created_at,
        updated_at
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Fetch authors
    const authorIds = [...new Set(tweets?.map(t => t.author_id) || [])];
    const { data: authors } = await client
      .from('users')
      .select('id, username, display_name, avatar')
      .in('id', authorIds);

    // Fetch user's likes
    const { data: likes } = await client
      .from('likes')
      .select('tweet_id')
      .eq('user_id', userId);

    // Fetch user's bookmarks
    const { data: bookmarks } = await client
      .from('bookmarks')
      .select('tweet_id')
      .eq('user_id', userId);

    // Fetch user's retweets
    const { data: retweets } = await client
      .from('retweets')
      .select('tweet_id')
      .eq('user_id', userId);

    // Combine data
    const authorMap = new Map(authors?.map(a => [a.id, a]));
    const likedSet = new Set(likes?.map(l => l.tweet_id));
    const bookmarkedSet = new Set(bookmarks?.map(b => b.tweet_id));
    const retweetedSet = new Set(retweets?.map(r => r.tweet_id));

    const tweetsWithAuthors = tweets?.map(tweet => ({
      ...tweet,
      author: authorMap.get(tweet.author_id) || { id: tweet.author_id, username: 'unknown', display_name: 'Unknown', avatar: null },
      is_liked: likedSet.has(tweet.id),
      is_bookmarked: bookmarkedSet.has(tweet.id),
      is_retweeted: retweetedSet.has(tweet.id),
    })) || [];

    return NextResponse.json({ success: true, data: tweetsWithAuthors });
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tweets' }, { status: 500 });
  }
}

// POST /api/tweets - Create a new tweet
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { content, images, authorId = CURRENT_USER.id } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }

    // Ensure user exists
    const { data: existingUser } = await client
      .from('users')
      .select('id')
      .eq('id', authorId)
      .single();

    if (!existingUser) {
      await client.from('users').insert({
        id: authorId,
        username: CURRENT_USER.username,
        display_name: CURRENT_USER.display_name,
        email: CURRENT_USER.email,
        bio: CURRENT_USER.bio,
      });
    }

    const { data: tweet, error } = await client
      .from('tweets')
      .insert({
        content: content.trim(),
        author_id: authorId,
        images: images || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: tweet });
  } catch (error) {
    console.error('Error creating tweet:', error);
    return NextResponse.json({ success: false, error: 'Failed to create tweet' }, { status: 500 });
  }
}
