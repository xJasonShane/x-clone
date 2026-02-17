import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { CURRENT_USER } from '@/lib/types';

// Helper function to update comments count
async function updateCommentsCount(client: ReturnType<typeof getSupabaseClient>, tweetId: string, increment: boolean) {
  const { data: tweet } = await client
    .from('tweets')
    .select('comments_count')
    .eq('id', tweetId)
    .single();

  if (tweet) {
    const newCount = increment
      ? (tweet.comments_count || 0) + 1
      : Math.max(0, (tweet.comments_count || 1) - 1);

    await client
      .from('tweets')
      .update({ comments_count: newCount })
      .eq('id', tweetId);
  }
}

// POST /api/comments - Create a reply
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { content, parentId, images, authorId = CURRENT_USER.id } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }

    if (!parentId) {
      return NextResponse.json({ success: false, error: 'Parent tweet ID is required' }, { status: 400 });
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

    // Create reply
    const { data: reply, error } = await client
      .from('tweets')
      .insert({
        content: content.trim(),
        author_id: authorId,
        parent_id: parentId,
        images: images || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Update parent's comments count
    await updateCommentsCount(client, parentId, true);

    return NextResponse.json({ success: true, data: reply });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json({ success: false, error: 'Failed to create reply' }, { status: 500 });
  }
}
