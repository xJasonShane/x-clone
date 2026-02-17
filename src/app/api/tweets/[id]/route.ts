import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { CURRENT_USER } from '@/lib/types';

// GET /api/tweets/[id] - Get single tweet with replies
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;

    // Get tweet
    const { data: tweet, error } = await client
      .from('tweets')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error || !tweet) {
      return NextResponse.json({ success: false, error: 'Tweet not found' }, { status: 404 });
    }

    // Get author
    const { data: author } = await client
      .from('users')
      .select('id, username, display_name, avatar')
      .eq('id', tweet.author_id)
      .single();

    // Get user's interactions
    const { data: likes } = await client
      .from('likes')
      .select('tweet_id')
      .eq('user_id', CURRENT_USER.id);

    const { data: bookmarks } = await client
      .from('bookmarks')
      .select('tweet_id')
      .eq('user_id', CURRENT_USER.id);

    const { data: retweets } = await client
      .from('retweets')
      .select('tweet_id')
      .eq('user_id', CURRENT_USER.id);

    const likedSet = new Set(likes?.map(l => l.tweet_id));
    const bookmarkedSet = new Set(bookmarks?.map(b => b.tweet_id));
    const retweetedSet = new Set(retweets?.map(r => r.tweet_id));

    // Get replies
    const { data: replies } = await client
      .from('tweets')
      .select('*')
      .eq('parent_id', id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    // Get reply authors
    const replyAuthorIds = [...new Set(replies?.map(r => r.author_id) || [])];
    const { data: replyAuthors } = await client
      .from('users')
      .select('id, username, display_name, avatar')
      .in('id', replyAuthorIds);

    const authorMap = new Map(replyAuthors?.map(a => [a.id, a]));

    const tweetWithAuthor = {
      ...tweet,
      author: author || { id: tweet.author_id, username: 'unknown', display_name: 'Unknown', avatar: null },
      is_liked: likedSet.has(tweet.id),
      is_bookmarked: bookmarkedSet.has(tweet.id),
      is_retweeted: retweetedSet.has(tweet.id),
    };

    const repliesWithAuthors = replies?.map(reply => ({
      ...reply,
      author: authorMap.get(reply.author_id) || { id: reply.author_id, username: 'unknown', display_name: 'Unknown', avatar: null },
      is_liked: likedSet.has(reply.id),
      is_bookmarked: bookmarkedSet.has(reply.id),
      is_retweeted: retweetedSet.has(reply.id),
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        tweet: tweetWithAuthor,
        replies: repliesWithAuthors,
      },
    });
  } catch (error) {
    console.error('Error fetching tweet:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tweet' }, { status: 500 });
  }
}

// DELETE /api/tweets/[id] - Delete a tweet (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;

    // Soft delete by setting is_deleted to true
    const { error } = await client
      .from('tweets')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tweet:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete tweet' }, { status: 500 });
  }
}

// PATCH /api/tweets/[id] - Update tweet data (stats, content, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;
    const body = await request.json();
    
    const {
      content,
      likes_count,
      retweets_count,
      comments_count,
      bookmarks_count,
      quotes_count,
      views_count,
      is_pinned,
      created_at,
    } = body;

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    
    if (content !== undefined) {
      if (!content || content.trim().length === 0) {
        return NextResponse.json({ success: false, error: 'Content cannot be empty' }, { status: 400 });
      }
      updateData.content = content.trim();
    }
    
    if (likes_count !== undefined) {
      updateData.likes_count = Math.max(0, parseInt(likes_count) || 0);
    }
    if (retweets_count !== undefined) {
      updateData.retweets_count = Math.max(0, parseInt(retweets_count) || 0);
    }
    if (comments_count !== undefined) {
      updateData.comments_count = Math.max(0, parseInt(comments_count) || 0);
    }
    if (bookmarks_count !== undefined) {
      updateData.bookmarks_count = Math.max(0, parseInt(bookmarks_count) || 0);
    }
    if (quotes_count !== undefined) {
      updateData.quotes_count = Math.max(0, parseInt(quotes_count) || 0);
    }
    if (views_count !== undefined) {
      updateData.views_count = Math.max(0, parseInt(views_count) || 0);
    }
    if (is_pinned !== undefined) {
      updateData.is_pinned = Boolean(is_pinned);
    }
    if (created_at !== undefined) {
      // Validate that it's a valid date string
      const date = new Date(created_at);
      if (!isNaN(date.getTime())) {
        updateData.created_at = created_at;
      }
    }

    const { data: tweet, error } = await client
      .from('tweets')
      .update(updateData)
      .eq('id', id)
      .eq('is_deleted', false)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!tweet) {
      return NextResponse.json({ success: false, error: 'Tweet not found' }, { status: 404 });
    }

    // Fetch author info to return complete TweetWithAuthor object
    const { data: author } = await client
      .from('users')
      .select('id, username, display_name, avatar')
      .eq('id', tweet.author_id)
      .single();

    // Get user's interactions for this tweet
    const { data: likes } = await client
      .from('likes')
      .select('tweet_id')
      .eq('user_id', CURRENT_USER.id)
      .eq('tweet_id', id);

    const { data: bookmarks } = await client
      .from('bookmarks')
      .select('tweet_id')
      .eq('user_id', CURRENT_USER.id)
      .eq('tweet_id', id);

    const { data: retweets } = await client
      .from('retweets')
      .select('tweet_id')
      .eq('user_id', CURRENT_USER.id)
      .eq('tweet_id', id);

    const tweetWithAuthor = {
      ...tweet,
      author: author || { id: tweet.author_id, username: 'unknown', display_name: 'Unknown', avatar: null },
      is_liked: (likes?.length || 0) > 0,
      is_bookmarked: (bookmarks?.length || 0) > 0,
      is_retweeted: (retweets?.length || 0) > 0,
    };

    return NextResponse.json({ success: true, data: tweetWithAuthor });
  } catch (error) {
    console.error('Error updating tweet:', error);
    return NextResponse.json({ success: false, error: 'Failed to update tweet' }, { status: 500 });
  }
}
