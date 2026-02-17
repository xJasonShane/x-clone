-- X Clone 数据库初始化脚本
-- 在 Supabase SQL Editor 中运行此脚本

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    avatar TEXT,
    bio TEXT,
    cover_image TEXT,
    followers_count INTEGER DEFAULT 0 NOT NULL,
    following_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- 推文表
CREATE TABLE IF NOT EXISTS tweets (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    author_id VARCHAR(36) NOT NULL REFERENCES users(id),
    images TEXT[],
    parent_id VARCHAR(36),
    quote_id VARCHAR(36),
    likes_count INTEGER DEFAULT 0 NOT NULL,
    bookmarks_count INTEGER DEFAULT 0 NOT NULL,
    retweets_count INTEGER DEFAULT 0 NOT NULL,
    comments_count INTEGER DEFAULT 0 NOT NULL,
    quotes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS tweets_author_id_idx ON tweets(author_id);
CREATE INDEX IF NOT EXISTS tweets_parent_id_idx ON tweets(parent_id);
CREATE INDEX IF NOT EXISTS tweets_created_at_idx ON tweets(created_at);
CREATE INDEX IF NOT EXISTS tweets_is_deleted_idx ON tweets(is_deleted);

-- 点赞表
CREATE TABLE IF NOT EXISTS likes (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    tweet_id VARCHAR(36) NOT NULL REFERENCES tweets(id),
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(tweet_id, user_id)
);

CREATE INDEX IF NOT EXISTS likes_tweet_id_idx ON likes(tweet_id);
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON likes(user_id);

-- 书签表
CREATE TABLE IF NOT EXISTS bookmarks (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    tweet_id VARCHAR(36) NOT NULL REFERENCES tweets(id),
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(tweet_id, user_id)
);

CREATE INDEX IF NOT EXISTS bookmarks_tweet_id_idx ON bookmarks(tweet_id);
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON bookmarks(user_id);

-- 转推表
CREATE TABLE IF NOT EXISTS retweets (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    tweet_id VARCHAR(36) NOT NULL REFERENCES tweets(id),
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(tweet_id, user_id)
);

CREATE INDEX IF NOT EXISTS retweets_tweet_id_idx ON retweets(tweet_id);
CREATE INDEX IF NOT EXISTS retweets_user_id_idx ON retweets(user_id);

-- 关注表
CREATE TABLE IF NOT EXISTS follows (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id VARCHAR(36) NOT NULL REFERENCES users(id),
    following_id VARCHAR(36) NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON follows(following_id);

-- 插入默认用户
INSERT INTO users (id, username, display_name, email, bio)
VALUES ('current-user', 'you', 'Your Name', 'you@example.com', 'Building the future, one tweet at a time.')
ON CONFLICT (id) DO NOTHING;

-- 启用 Row Level Security (可选，根据需要配置)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE retweets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
