import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'tweets'; // tweets, users
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  if (!query || query.trim().length === 0) {
    return NextResponse.json({
      success: true,
      data: { tweets: [], users: [] },
    });
  }

  const searchTerm = query.trim();

  try {
    if (type === 'users') {
      // Search users
      const { data: users, error } = await supabase
        .from('users')
        .select('id, username, display_name, avatar, bio, followers_count, following_count')
        .or(`display_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
        .order('followers_count', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: { tweets: [], users: users || [] },
      });
    } else {
      // Search tweets
      const { data: tweets, error } = await supabase
        .from('tweets')
        .select(`
          id,
          content,
          images,
          created_at,
          likes_count,
          retweets_count,
          comments_count,
          bookmarks_count,
          quotes_count,
          author:users!tweets_user_id_fkey (
            id,
            username,
            display_name,
            avatar
          )
        `)
        .ilike('content', `%${searchTerm}%`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: { tweets: tweets || [], users: [] },
      });
    }
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
