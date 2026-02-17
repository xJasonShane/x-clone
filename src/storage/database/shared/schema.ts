import { pgTable, serial, timestamp, varchar, text, boolean, integer, index, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

// System health check table
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// Users table
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    username: varchar("username", { length: 50 }).notNull().unique(),
    displayName: varchar("display_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    avatar: text("avatar"),
    bio: text("bio"),
    coverImage: text("cover_image"),
    followersCount: integer("followers_count").default(0).notNull(),
    followingCount: integer("following_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index("users_username_idx").on(table.username),
    index("users_email_idx").on(table.email),
  ]
);

// Tweets table
export const tweets = pgTable(
  "tweets",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    content: text("content").notNull(),
    authorId: varchar("author_id", { length: 36 }).notNull(),
    images: text("images").array(),
    parentId: varchar("parent_id", { length: 36 }), // For replies
    quoteId: varchar("quote_id", { length: 36 }), // For quote tweets
    likesCount: integer("likes_count").default(0).notNull(),
    bookmarksCount: integer("bookmarks_count").default(0).notNull(),
    retweetsCount: integer("retweets_count").default(0).notNull(),
    commentsCount: integer("comments_count").default(0).notNull(),
    quotesCount: integer("quotes_count").default(0).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index("tweets_author_id_idx").on(table.authorId),
    index("tweets_parent_id_idx").on(table.parentId),
    index("tweets_created_at_idx").on(table.createdAt),
    index("tweets_is_deleted_idx").on(table.isDeleted),
  ]
);

// Likes table
export const likes = pgTable(
  "likes",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    tweetId: varchar("tweet_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("likes_tweet_id_idx").on(table.tweetId),
    index("likes_user_id_idx").on(table.userId),
    unique().on(table.tweetId, table.userId),
  ]
);

// Bookmarks table
export const bookmarks = pgTable(
  "bookmarks",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    tweetId: varchar("tweet_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("bookmarks_tweet_id_idx").on(table.tweetId),
    index("bookmarks_user_id_idx").on(table.userId),
    unique().on(table.tweetId, table.userId),
  ]
);

// Retweets table
export const retweets = pgTable(
  "retweets",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    tweetId: varchar("tweet_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("retweets_tweet_id_idx").on(table.tweetId),
    index("retweets_user_id_idx").on(table.userId),
    unique().on(table.tweetId, table.userId),
  ]
);

// Follows table
export const follows = pgTable(
  "follows",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    followerId: varchar("follower_id", { length: 36 }).notNull(),
    followingId: varchar("following_id", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("follows_follower_id_idx").on(table.followerId),
    index("follows_following_id_idx").on(table.followingId),
    unique().on(table.followerId, table.followingId),
  ]
);

// Hashtags table
export const hashtags = pgTable(
  "hashtags",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 100 }).notNull().unique(),
    tweetsCount: integer("tweets_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("hashtags_name_idx").on(table.name),
  ]
);

// Tweet Hashtags junction table
export const tweetHashtags = pgTable(
  "tweet_hashtags",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    tweetId: varchar("tweet_id", { length: 36 }).notNull(),
    hashtagId: varchar("hashtag_id", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("tweet_hashtags_tweet_id_idx").on(table.tweetId),
    index("tweet_hashtags_hashtag_id_idx").on(table.hashtagId),
    unique().on(table.tweetId, table.hashtagId),
  ]
);

// Mentions table
export const mentions = pgTable(
  "mentions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    tweetId: varchar("tweet_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("mentions_tweet_id_idx").on(table.tweetId),
    index("mentions_user_id_idx").on(table.userId),
  ]
);

// Schema factory for Zod validation
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

// User schemas
export const insertUserSchema = createCoercedInsertSchema(users).pick({
  username: true,
  displayName: true,
  email: true,
  avatar: true,
  bio: true,
});

export const updateUserSchema = createCoercedInsertSchema(users)
  .pick({
    displayName: true,
    avatar: true,
    bio: true,
    coverImage: true,
  })
  .partial();

// Tweet schemas
export const insertTweetSchema = createCoercedInsertSchema(tweets).pick({
  content: true,
  authorId: true,
  images: true,
  parentId: true,
  quoteId: true,
});

// Like schema
export const insertLikeSchema = createCoercedInsertSchema(likes).pick({
  tweetId: true,
  userId: true,
});

// Bookmark schema
export const insertBookmarkSchema = createCoercedInsertSchema(bookmarks).pick({
  tweetId: true,
  userId: true,
});

// Retweet schema
export const insertRetweetSchema = createCoercedInsertSchema(retweets).pick({
  tweetId: true,
  userId: true,
});

// Follow schema
export const insertFollowSchema = createCoercedInsertSchema(follows).pick({
  followerId: true,
  followingId: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type Tweet = typeof tweets.$inferSelect;
export type InsertTweet = z.infer<typeof insertTweetSchema>;
export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Retweet = typeof retweets.$inferSelect;
export type InsertRetweet = z.infer<typeof insertRetweetSchema>;
export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Hashtag = typeof hashtags.$inferSelect;
export type Mention = typeof mentions.$inferSelect;
