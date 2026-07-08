export declare const DatabaseConfig: {
    /** PostgreSQL 连接字符串 */
    readonly url: string;
    /** 连接池最小连接数 */
    readonly poolMin: number;
    /** 连接池最大连接数 */
    readonly poolMax: number;
    /** SSL 模式 (require | prefer | disable) */
    readonly sslMode: "require" | "prefer" | "disable";
};
export declare const RedisConfig: {
    /** Redis 连接 URL */
    readonly url: string;
    /** Upstash REST Token（REST API 模式下使用） */
    readonly token: string;
    /** 是否启用 Redis 限流（关闭时使用内存限流） */
    readonly enabled: boolean;
};
export declare const OSSConfig: {
    /** AccessKey ID */
    readonly accessKeyId: string;
    /** AccessKey Secret */
    readonly accessKeySecret: string;
    /** Bucket 名称 */
    readonly bucket: string;
    /** OSS Region */
    readonly region: string;
    /** OSS Endpoint（内网上传） */
    readonly endpoint: string;
    /** CDN 加速域名（外网访问） */
    readonly cdnDomain: string;
    /** STS 角色 ARN（临时凭证） */
    readonly stsRoleArn: string;
    /** STS 临时凭证有效期（秒） */
    readonly stsDuration: number;
    /** 上传文件大小上限（字节），默认 10MB */
    readonly maxFileSize: number;
    /** 允许上传的文件类型 */
    readonly allowedTypes: string[];
    /** 是否启用（关闭时使用本地 MinIO） */
    readonly enabled: boolean;
};
export declare const ContentSafetyConfig: {
    /** AccessKey ID（建议使用子账号，最小权限） */
    readonly accessKeyId: string;
    /** AccessKey Secret */
    readonly accessKeySecret: string;
    /** API Endpoint */
    readonly endpoint: string;
    /** 审核失败重试次数 */
    readonly retryCount: number;
    /** 重试间隔（毫秒） */
    readonly retryDelay: number;
    /** 审核超时时间（毫秒） */
    readonly timeout: number;
    /** 是否启用（关闭时帖子直接发布） */
    readonly enabled: boolean;
    /** 降级策略：API 不可用时是否自动放行 */
    readonly autoApproveOnFailure: boolean;
};
export declare const EmailConfig: {
    /** 发信地址 */
    readonly fromAddress: string;
    /** 发信人名称 */
    readonly fromName: string;
    /** SMTP 服务器 */
    readonly smtpHost: string;
    /** SMTP 端口 */
    readonly smtpPort: number;
    /** SMTP 用户名 */
    readonly smtpUsername: string;
    /** SMTP 密码 */
    readonly smtpPassword: string;
    /** 是否启用 SSL */
    readonly smtpSecure: boolean;
    /** 邮箱验证令牌有效期（秒） */
    readonly verifyTokenTTL: number;
    /** 密码重置令牌有效期（秒） */
    readonly resetTokenTTL: number;
    /** 是否启用（关闭时跳过邮箱验证） */
    readonly enabled: boolean;
};
export declare const GitHubOAuthConfig: {
    /** OAuth App Client ID */
    readonly clientId: string;
    /** OAuth App Client Secret */
    readonly clientSecret: string;
    /** 授权回调地址 */
    readonly redirectUri: string;
    /** GitHub 授权页面 URL */
    readonly authorizeUrl: "https://github.com/login/oauth/authorize";
    /** GitHub Token 换取 URL */
    readonly tokenUrl: "https://github.com/login/oauth/access_token";
    /** GitHub 用户信息 API */
    readonly userApiUrl: "https://api.github.com/user";
    /** 是否启用 */
    readonly enabled: boolean;
};
export declare const SSEConfig: {
    /** SSE 服务地址（前端 EventSource 连接用） */
    readonly publicUrl: string;
    /** SSE 服务内网地址（FC → ECS 内网推送用） */
    readonly internalUrl: string;
    /** 内网推送接口密钥（FC 与 ECS 共享） */
    readonly internalPushSecret: string;
    /** SSE Ticket 签名密钥（FC 与 ECS 共享，至少 32 字符） */
    readonly ticketSecret: string;
    /** Ticket 有效期（秒） */
    readonly ticketExpiresIn: number;
    /** 心跳间隔（秒） */
    readonly heartbeatInterval: number;
    /** 单用户最大并发连接数 */
    readonly maxConnectionsPerUser: number;
    /** 全局最大连接数 */
    readonly maxConnections: number;
    /** SSE 服务端口 */
    readonly port: number;
};
export declare const TurnstileConfig: {
    /** Site Key（前端使用） */
    readonly siteKey: string;
    /** Secret Key（后端校验） */
    readonly secretKey: string;
    /** 校验 API 地址 */
    readonly verifyUrl: "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    /** 是否启用 */
    readonly enabled: boolean;
};
export declare const JWTConfig: {
    /** JWT 签名密钥（至少 32 字符） */
    readonly secret: string;
    /** Access Token 有效期（秒），默认 30 分钟 */
    readonly accessExpiresIn: number;
    /** Refresh Token 有效期（秒），默认 7 天 */
    readonly refreshExpiresIn: number;
    /** JWT 签发者 */
    readonly issuer: string;
};
export declare const RateLimitConfig: {
    /** 全局接口限流（次/分钟） */
    readonly globalRpm: number;
    /** 登录接口限流（次/分钟） */
    readonly loginRpm: number;
    /** 注册接口限流（次/分钟） */
    readonly registerRpm: number;
    /** 发帖接口限流（次/分钟） */
    readonly createPostRpm: number;
};
export declare const AppBaseConfig: {
    /** 应用名称 */
    readonly name: string;
    /** 站点 URL */
    readonly siteUrl: string;
    /** API 基础 URL */
    readonly apiBaseUrl: string;
    /** API 服务端口 */
    readonly apiPort: number;
    /** 上传文件公开基础 URL */
    readonly uploadPublicBaseUrl: string;
    /** 运行环境 */
    readonly nodeEnv: "development" | "production" | "test";
    /** 是否为生产环境 */
    readonly isProduction: boolean;
};
export declare const ServiceConfig: {
    readonly database: {
        /** PostgreSQL 连接字符串 */
        readonly url: string;
        /** 连接池最小连接数 */
        readonly poolMin: number;
        /** 连接池最大连接数 */
        readonly poolMax: number;
        /** SSL 模式 (require | prefer | disable) */
        readonly sslMode: "require" | "prefer" | "disable";
    };
    readonly redis: {
        /** Redis 连接 URL */
        readonly url: string;
        /** Upstash REST Token（REST API 模式下使用） */
        readonly token: string;
        /** 是否启用 Redis 限流（关闭时使用内存限流） */
        readonly enabled: boolean;
    };
    readonly oss: {
        /** AccessKey ID */
        readonly accessKeyId: string;
        /** AccessKey Secret */
        readonly accessKeySecret: string;
        /** Bucket 名称 */
        readonly bucket: string;
        /** OSS Region */
        readonly region: string;
        /** OSS Endpoint（内网上传） */
        readonly endpoint: string;
        /** CDN 加速域名（外网访问） */
        readonly cdnDomain: string;
        /** STS 角色 ARN（临时凭证） */
        readonly stsRoleArn: string;
        /** STS 临时凭证有效期（秒） */
        readonly stsDuration: number;
        /** 上传文件大小上限（字节），默认 10MB */
        readonly maxFileSize: number;
        /** 允许上传的文件类型 */
        readonly allowedTypes: string[];
        /** 是否启用（关闭时使用本地 MinIO） */
        readonly enabled: boolean;
    };
    readonly contentSafety: {
        /** AccessKey ID（建议使用子账号，最小权限） */
        readonly accessKeyId: string;
        /** AccessKey Secret */
        readonly accessKeySecret: string;
        /** API Endpoint */
        readonly endpoint: string;
        /** 审核失败重试次数 */
        readonly retryCount: number;
        /** 重试间隔（毫秒） */
        readonly retryDelay: number;
        /** 审核超时时间（毫秒） */
        readonly timeout: number;
        /** 是否启用（关闭时帖子直接发布） */
        readonly enabled: boolean;
        /** 降级策略：API 不可用时是否自动放行 */
        readonly autoApproveOnFailure: boolean;
    };
    readonly email: {
        /** 发信地址 */
        readonly fromAddress: string;
        /** 发信人名称 */
        readonly fromName: string;
        /** SMTP 服务器 */
        readonly smtpHost: string;
        /** SMTP 端口 */
        readonly smtpPort: number;
        /** SMTP 用户名 */
        readonly smtpUsername: string;
        /** SMTP 密码 */
        readonly smtpPassword: string;
        /** 是否启用 SSL */
        readonly smtpSecure: boolean;
        /** 邮箱验证令牌有效期（秒） */
        readonly verifyTokenTTL: number;
        /** 密码重置令牌有效期（秒） */
        readonly resetTokenTTL: number;
        /** 是否启用（关闭时跳过邮箱验证） */
        readonly enabled: boolean;
    };
    readonly githubOAuth: {
        /** OAuth App Client ID */
        readonly clientId: string;
        /** OAuth App Client Secret */
        readonly clientSecret: string;
        /** 授权回调地址 */
        readonly redirectUri: string;
        /** GitHub 授权页面 URL */
        readonly authorizeUrl: "https://github.com/login/oauth/authorize";
        /** GitHub Token 换取 URL */
        readonly tokenUrl: "https://github.com/login/oauth/access_token";
        /** GitHub 用户信息 API */
        readonly userApiUrl: "https://api.github.com/user";
        /** 是否启用 */
        readonly enabled: boolean;
    };
    readonly sse: {
        /** SSE 服务地址（前端 EventSource 连接用） */
        readonly publicUrl: string;
        /** SSE 服务内网地址（FC → ECS 内网推送用） */
        readonly internalUrl: string;
        /** 内网推送接口密钥（FC 与 ECS 共享） */
        readonly internalPushSecret: string;
        /** SSE Ticket 签名密钥（FC 与 ECS 共享，至少 32 字符） */
        readonly ticketSecret: string;
        /** Ticket 有效期（秒） */
        readonly ticketExpiresIn: number;
        /** 心跳间隔（秒） */
        readonly heartbeatInterval: number;
        /** 单用户最大并发连接数 */
        readonly maxConnectionsPerUser: number;
        /** 全局最大连接数 */
        readonly maxConnections: number;
        /** SSE 服务端口 */
        readonly port: number;
    };
    readonly turnstile: {
        /** Site Key（前端使用） */
        readonly siteKey: string;
        /** Secret Key（后端校验） */
        readonly secretKey: string;
        /** 校验 API 地址 */
        readonly verifyUrl: "https://challenges.cloudflare.com/turnstile/v0/siteverify";
        /** 是否启用 */
        readonly enabled: boolean;
    };
    readonly jwt: {
        /** JWT 签名密钥（至少 32 字符） */
        readonly secret: string;
        /** Access Token 有效期（秒），默认 30 分钟 */
        readonly accessExpiresIn: number;
        /** Refresh Token 有效期（秒），默认 7 天 */
        readonly refreshExpiresIn: number;
        /** JWT 签发者 */
        readonly issuer: string;
    };
    readonly rateLimit: {
        /** 全局接口限流（次/分钟） */
        readonly globalRpm: number;
        /** 登录接口限流（次/分钟） */
        readonly loginRpm: number;
        /** 注册接口限流（次/分钟） */
        readonly registerRpm: number;
        /** 发帖接口限流（次/分钟） */
        readonly createPostRpm: number;
    };
    readonly app: {
        /** 应用名称 */
        readonly name: string;
        /** 站点 URL */
        readonly siteUrl: string;
        /** API 基础 URL */
        readonly apiBaseUrl: string;
        /** API 服务端口 */
        readonly apiPort: number;
        /** 上传文件公开基础 URL */
        readonly uploadPublicBaseUrl: string;
        /** 运行环境 */
        readonly nodeEnv: "development" | "production" | "test";
        /** 是否为生产环境 */
        readonly isProduction: boolean;
    };
};
export type ServiceConfigType = typeof ServiceConfig;
//# sourceMappingURL=services-config.d.ts.map