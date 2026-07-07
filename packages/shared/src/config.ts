// ============================================================
// bingbingbingo — Global Business Config
// ============================================================

export const AppConfig = {
  /** Maximum comment nesting depth */
  COMMENT_MAX_DEPTH: 2,

  /** Post title max characters */
  POST_TITLE_MAX_LENGTH: 200,

  /** Post content max characters */
  POST_CONTENT_MAX_LENGTH: 50000,

  /** Comment content max characters */
  COMMENT_CONTENT_MAX_LENGTH: 5000,

  /** Max tags per post */
  POST_TAG_MAX_COUNT: 5,

  /** Tag name min characters */
  TAG_NAME_MIN_LENGTH: 2,

  /** Tag name max characters */
  TAG_NAME_MAX_LENGTH: 50,

  /** Max projects per user */
  PROJECT_MAX_PER_USER: 20,

  /** Project title max characters */
  PROJECT_TITLE_MAX_LENGTH: 100,

  /** User bio max characters */
  USER_BIO_MAX_LENGTH: 500,

  /** Username min characters */
  USERNAME_MIN_LENGTH: 3,

  /** Username max characters */
  USERNAME_MAX_LENGTH: 30,

  /** Password min characters */
  PASSWORD_MIN_LENGTH: 8,

  /** Feed page size */
  FEED_PAGE_SIZE: 20,

  /** Comment page size */
  COMMENT_PAGE_SIZE: 30,

  /** Notification page size */
  NOTIFICATION_PAGE_SIZE: 30,

  /** SSR warmup post count */
  HOME_RECENT_POSTS_COUNT: 20,

  /** Search page size */
  SEARCH_PAGE_SIZE: 20,

  /** Search keyword min length */
  SEARCH_KEYWORD_MIN_LENGTH: 2,

  /** SSE ticket TTL (seconds) */
  SSE_TICKET_EXPIRES_IN: 60,

  /** SSE heartbeat interval (seconds) */
  SSE_HEARTBEAT_INTERVAL: 30,

  /** SSE max connections per user */
  SSE_MAX_CONNECTIONS_PER_USER: 5,

  /** Access token TTL (seconds) — 30 minutes */
  JWT_ACCESS_EXPIRES_IN: 1800,

  /** Refresh token TTL (seconds) — 7 days */
  JWT_REFRESH_EXPIRES_IN: 604800,
} as const
