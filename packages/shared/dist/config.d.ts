export declare const AppConfig: {
    /** Maximum comment nesting depth */
    readonly COMMENT_MAX_DEPTH: 2;
    /** Post title max characters */
    readonly POST_TITLE_MAX_LENGTH: 200;
    /** Post content max characters */
    readonly POST_CONTENT_MAX_LENGTH: 50000;
    /** Comment content max characters */
    readonly COMMENT_CONTENT_MAX_LENGTH: 5000;
    /** Max tags per post */
    readonly POST_TAG_MAX_COUNT: 5;
    /** Tag name min characters */
    readonly TAG_NAME_MIN_LENGTH: 2;
    /** Tag name max characters */
    readonly TAG_NAME_MAX_LENGTH: 50;
    /** Max projects per user */
    readonly PROJECT_MAX_PER_USER: 20;
    /** Project title max characters */
    readonly PROJECT_TITLE_MAX_LENGTH: 100;
    /** User bio max characters */
    readonly USER_BIO_MAX_LENGTH: 500;
    /** Username min characters */
    readonly USERNAME_MIN_LENGTH: 3;
    /** Username max characters */
    readonly USERNAME_MAX_LENGTH: 30;
    /** Password min characters */
    readonly PASSWORD_MIN_LENGTH: 8;
    /** Feed page size */
    readonly FEED_PAGE_SIZE: 20;
    /** Comment page size */
    readonly COMMENT_PAGE_SIZE: 30;
    /** Notification page size */
    readonly NOTIFICATION_PAGE_SIZE: 30;
    /** SSR warmup post count */
    readonly HOME_RECENT_POSTS_COUNT: 20;
    /** Search page size */
    readonly SEARCH_PAGE_SIZE: 20;
    /** Search keyword min length */
    readonly SEARCH_KEYWORD_MIN_LENGTH: 2;
    /** SSE ticket TTL (seconds) */
    readonly SSE_TICKET_EXPIRES_IN: 60;
    /** SSE heartbeat interval (seconds) */
    readonly SSE_HEARTBEAT_INTERVAL: 30;
    /** SSE max connections per user */
    readonly SSE_MAX_CONNECTIONS_PER_USER: 5;
    /** Access token TTL (seconds) — 30 minutes */
    readonly JWT_ACCESS_EXPIRES_IN: 1800;
    /** Refresh token TTL (seconds) — 7 days */
    readonly JWT_REFRESH_EXPIRES_IN: 604800;
};
//# sourceMappingURL=config.d.ts.map