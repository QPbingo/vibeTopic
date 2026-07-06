# bingbingbingo 错误码清单

## 使用规范

- 所有 API 响应采用统一格式：`{ "code": number, "data": T | null, "message": string }`
- `code = 0` 表示成功
- 错误码按业务模块分段，每段 1000 个编码空间
- 定义文件路径：`packages/shared/src/error-codes.ts`
- 错误消息 `message` 字段直接返回给前端，用于展示提示

## 错误码分段

| 号段 | 模块 |
|------|------|
| 10001 - 10999 | 通用错误 / 系统错误 |
| 11001 - 11999 | 认证相关（auth） |
| 12001 - 12999 | 用户相关（user） |
| 13001 - 13999 | 帖子相关（post） |
| 14001 - 14999 | 评论相关（comment） |
| 15001 - 15999 | 点赞相关（like） |
| 16001 - 16999 | 收藏相关（bookmark） |
| 17001 - 17999 | 关注相关（follow） |
| 18001 - 18999 | 标签相关（tag） |
| 19001 - 19999 | 作品相关（project） |
| 20001 - 20999 | 文件上传相关（media） |
| 21001 - 21999 | 通知相关（notification） |
| 22001 - 22999 | 搜索相关（search） |

---

## 完整错误码

### 10001 - 10999：通用 / 系统错误

| 错误码 | message | 说明 |
|--------|---------|------|
| 0 | ok | 请求成功 |
| 10001 | 服务器内部错误 | 未预期的服务器错误 |
| 10002 | 参数校验失败 | 请求参数不符合要求 |
| 10003 | 请求过于频繁 | 触发频率限制 |
| 10004 | 资源不存在 | 通用的 404 错误 |
| 10005 | 无权限访问 | 通用的 403 错误 |
| 10006 | 请求体格式错误 | JSON 解析失败等 |
| 10007 | 数据库操作失败 | 数据库层面的错误 |

### 11001 - 11999：认证相关

| 错误码 | message | 说明 |
|--------|---------|------|
| 11001 | 用户名或密码错误 | 登录凭据不匹配 |
| 11002 | 用户名已存在 | 注册时用户名重复 |
| 11003 | 邮箱已被注册 | 注册时邮箱重复 |
| 11004 | 未登录 | 访问需要认证的接口但未携带有效 token |
| 11005 | 登录已过期 | Access Token 或 Refresh Token 已过期 |
| 11006 | 密码格式不正确 | 密码不满足复杂度要求（最少8字符，含字母和数字） |
| 11007 | 验证码错误 | 注册/找回密码时验证码不匹配 |
| 11008 | 验证码已过期 | 验证码超过有效期 |
| 11009 | 邮箱格式不正确 | 邮箱校验失败 |
| 11010 | 用户名格式不正确 | 用户名校验失败（3-30字符，仅字母数字下划线） |
| 11011 | GitHub OAuth 授权失败 | GitHub 登录过程中的错误 |
| 11012 | 用户已被封禁 | 账号状态为 banned |
| 11013 | Refresh Token 无效 | Token 不匹配或已被撤销 |
| 11014 | 邮箱未验证 | 请先验证邮箱再登录 |
| 11015 | 验证链接无效或已过期 | 邮箱验证 token 无效/过期/已使用 |
| 11016 | 重置密码链接无效或已过期 | 密码重置 token 无效/过期/已使用 |
| 11017 | 邮箱未注册 | 忘记密码时输入的邮箱未注册 |

### 12001 - 12999：用户相关

| 错误码 | message | 说明 |
|--------|---------|------|
| 12001 | 用户不存在 | 查询的用户 ID 无对应记录 |
| 12002 | 不能操作自己 | 某些不允许自己操作自己的场景（如关注自己） |
| 12003 | 用户信息更新失败 | 更新用户资料时出错 |
| 12004 | 邮箱已被其他用户绑定 | 绑定邮箱时冲突 |
| 12005 | GitHub 账号已被其他用户绑定 | 绑定 GitHub 时冲突 |

### 13001 - 13999：帖子相关

| 错误码 | message | 说明 |
|--------|---------|------|
| 13001 | 帖子不存在 | 帖子 ID 无对应记录或已删除 |
| 13002 | 标题不能为空 | 帖子标题为空 |
| 13003 | 标题长度超出限制 | 帖子标题超过 200 字符 |
| 13004 | 内容不能为空 | 帖子正文为空 |
| 13005 | 内容长度超出限制 | 帖子正文超过限制（如 50000 字符） |
| 13006 | 无权限编辑该帖子 | 非帖子作者尝试编辑 |
| 13007 | 无权限删除该帖子 | 非帖子作者且非管理员尝试删除 |
| 13008 | 内容审核未通过 | 帖子内容违反社区规范，请修改后重新提交 |
| 13009 | 帖子正在审核中 | 帖子处于 pending_review 状态，审核完成前不可操作 |

### 14001 - 14999：评论相关

| 错误码 | message | 说明 |
|--------|---------|------|
| 14001 | 评论不存在 | 评论 ID 无对应记录 |
| 14002 | 评论内容不能为空 | 评论正文为空 |
| 14003 | 评论内容长度超出限制 | 评论超过最大长度（如 5000 字符） |
| 14004 | 帖子不存在或已删除 | 评论的帖子无效 |
| 14005 | 嵌套深度已达上限 | 超过配置文件中设定的最大嵌套深度 |
| 14006 | 父评论不存在 | 回复的父评论 ID 无对应记录 |
| 14007 | 无权限删除该评论 | 非评论作者且非管理员尝试删除 |

### 15001 - 15999：点赞相关

| 错误码 | message | 说明 |
|--------|---------|------|
| 15001 | 已点赞 | 已对该目标点过赞，重复调用 POST like 时报错 |
| 15002 | 未点赞 | 取消点赞时目标未被用户点过赞，DELETE like 时报错 |
| 15003 | 点赞目标不存在 | 帖子或评论不存在 |

### 16001 - 16999：收藏相关

| 错误码 | message | 说明 |
|--------|---------|------|
| 16001 | 已收藏 | 已收藏过该帖子 |
| 16002 | 未收藏 | 取消收藏时该帖子未被收藏 |
| 16003 | 帖子不存在 | 收藏的帖子不存在或已删除 |

### 17001 - 17999：关注相关

| 错误码 | message | 说明 |
|--------|---------|------|
| 17001 | 已关注 | 已关注该用户 |
| 17002 | 未关注 | 取消关注时未关注该用户 |
| 17003 | 目标用户不存在 | 关注的用户 ID 不存在 |
| 17004 | 不能关注自己 | 关注目标和操作人是同一用户 |

### 18001 - 18999：标签相关

| 错误码 | message | 说明 |
|--------|---------|------|
| 18001 | 标签不存在 | 标签 ID 无对应记录 |
| 18002 | 标签名称已存在 | 创建标签时名称重复 |
| 18003 | 标签名称格式不正确 | 标签名不满足格式要求（2-50字符） |
| 18004 | 帖子标签数量超限 | 单帖标签超过最大数量（如 5 个） |

### 19001 - 19999：作品相关

| 错误码 | message | 说明 |
|--------|---------|------|
| 19001 | 作品不存在 | 作品 ID 无对应记录 |
| 19002 | 作品名称不能为空 | 作品标题为空 |
| 19003 | 作品数量已达上限 | 单个用户作品数量超过限制（如 20 个） |
| 19004 | 无权限操作该作品 | 非作品作者尝试编辑/删除 |

### 20001 - 20999：文件上传相关

| 错误码 | message | 说明 |
|--------|---------|------|
| 20001 | 文件大小超出限制 | 单个文件超过大小限制（如图片最大 10MB） |
| 20002 | 文件类型不支持 | 文件格式不在允许列表中 |
| 20003 | 上传凭证获取失败 | STS Token 颁发失败 |
| 20004 | OSS 上传失败 | 文件上传到 OSS 时出错 |
| 20005 | 文件不存在 | 文件 ID 无对应 OSS 记录 |

### 21001 - 21999：通知相关

| 错误码 | message | 说明 |
|--------|---------|------|
| 21001 | 无未读通知 | 无新通知 |

### 22001 - 22999：搜索相关

| 错误码 | message | 说明 |
|--------|---------|------|
| 22001 | 搜索关键词不能为空 | 搜索时未提供查询词 |
| 22002 | 搜索关键词过短 | 查询词少于 2 个字符 |

---

## TypeScript 定义（packages/shared/src/error-codes.ts）

```typescript
export const ErrorCodes = {
  // 成功
  OK: 0,

  // 通用
  INTERNAL_ERROR: 10001,
  VALIDATION_ERROR: 10002,
  RATE_LIMITED: 10003,
  NOT_FOUND: 10004,
  FORBIDDEN: 10005,
  INVALID_REQUEST_BODY: 10006,
  DATABASE_ERROR: 10007,

  // 认证
  INVALID_CREDENTIALS: 11001,
  USERNAME_TAKEN: 11002,
  EMAIL_TAKEN: 11003,
  UNAUTHORIZED: 11004,
  TOKEN_EXPIRED: 11005,
  INVALID_PASSWORD_FORMAT: 11006,
  INVALID_VERIFICATION_CODE: 11007,
  VERIFICATION_CODE_EXPIRED: 11008,
  INVALID_EMAIL_FORMAT: 11009,
  INVALID_USERNAME_FORMAT: 11010,
  GITHUB_OAUTH_FAILED: 11011,
  USER_BANNED: 11012,
  INVALID_REFRESH_TOKEN: 11013,
  EMAIL_NOT_VERIFIED: 11014,
  INVALID_VERIFY_TOKEN: 11015,
  INVALID_RESET_TOKEN: 11016,
  EMAIL_NOT_REGISTERED: 11017,

  // 用户
  USER_NOT_FOUND: 12001,
  CANNOT_OPERATE_SELF: 12002,
  USER_UPDATE_FAILED: 12003,
  EMAIL_ALREADY_BOUND: 12004,
  GITHUB_ALREADY_BOUND: 12005,

  // 帖子
  POST_NOT_FOUND: 13001,
  POST_TITLE_EMPTY: 13002,
  POST_TITLE_TOO_LONG: 13003,
  POST_CONTENT_EMPTY: 13004,
  POST_CONTENT_TOO_LONG: 13005,
  POST_EDIT_FORBIDDEN: 13006,
  POST_DELETE_FORBIDDEN: 13007,
  POST_CONTENT_REJECTED: 13008,
  POST_UNDER_REVIEW: 13009,

  // 评论
  COMMENT_NOT_FOUND: 14001,
  COMMENT_CONTENT_EMPTY: 14002,
  COMMENT_CONTENT_TOO_LONG: 14003,
  COMMENT_POST_INVALID: 14004,
  COMMENT_DEPTH_EXCEEDED: 14005,
  COMMENT_PARENT_NOT_FOUND: 14006,
  COMMENT_DELETE_FORBIDDEN: 14007,

  // 点赞
  ALREADY_LIKED: 15001,
  NOT_LIKED: 15002,
  LIKE_TARGET_NOT_FOUND: 15003,

  // 收藏
  ALREADY_BOOKMARKED: 16001,
  NOT_BOOKMARKED: 16002,
  BOOKMARK_POST_NOT_FOUND: 16003,

  // 关注
  ALREADY_FOLLOWED: 17001,
  NOT_FOLLOWED: 17002,
  FOLLOW_TARGET_NOT_FOUND: 17003,
  CANNOT_FOLLOW_SELF: 17004,

  // 标签
  TAG_NOT_FOUND: 18001,
  TAG_NAME_TAKEN: 18002,
  TAG_NAME_INVALID: 18003,
  POST_TAG_LIMIT_EXCEEDED: 18004,

  // 作品
  PROJECT_NOT_FOUND: 19001,
  PROJECT_TITLE_EMPTY: 19002,
  PROJECT_LIMIT_EXCEEDED: 19003,
  PROJECT_OPERATION_FORBIDDEN: 19004,

  // 文件
  FILE_SIZE_EXCEEDED: 20001,
  FILE_TYPE_UNSUPPORTED: 20002,
  UPLOAD_CREDENTIAL_FAILED: 20003,
  OSS_UPLOAD_FAILED: 20004,
  FILE_NOT_FOUND: 20005,

  // 通知
  NO_UNREAD_NOTIFICATIONS: 21001,

  // 搜索
  SEARCH_KEYWORD_EMPTY: 22001,
  SEARCH_KEYWORD_TOO_SHORT: 22002,
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.OK]: 'ok',
  [ErrorCodes.INTERNAL_ERROR]: '服务器内部错误',
  [ErrorCodes.VALIDATION_ERROR]: '参数校验失败',
  [ErrorCodes.RATE_LIMITED]: '请求过于频繁',
  [ErrorCodes.NOT_FOUND]: '资源不存在',
  [ErrorCodes.FORBIDDEN]: '无权限访问',
  [ErrorCodes.INVALID_REQUEST_BODY]: '请求体格式错误',
  [ErrorCodes.DATABASE_ERROR]: '数据库操作失败',
  [ErrorCodes.INVALID_CREDENTIALS]: '用户名或密码错误',
  [ErrorCodes.USERNAME_TAKEN]: '用户名已存在',
  [ErrorCodes.EMAIL_TAKEN]: '邮箱已被注册',
  [ErrorCodes.UNAUTHORIZED]: '未登录',
  [ErrorCodes.TOKEN_EXPIRED]: '登录已过期',
  [ErrorCodes.INVALID_PASSWORD_FORMAT]: '密码格式不正确',
  [ErrorCodes.INVALID_VERIFICATION_CODE]: '验证码错误',
  [ErrorCodes.VERIFICATION_CODE_EXPIRED]: '验证码已过期',
  [ErrorCodes.INVALID_EMAIL_FORMAT]: '邮箱格式不正确',
  [ErrorCodes.INVALID_USERNAME_FORMAT]: '用户名格式不正确',
  [ErrorCodes.GITHUB_OAUTH_FAILED]: 'GitHub OAuth 授权失败',
  [ErrorCodes.USER_BANNED]: '用户已被封禁',
  [ErrorCodes.INVALID_REFRESH_TOKEN]: 'Refresh Token 无效',
  [ErrorCodes.EMAIL_NOT_VERIFIED]: '邮箱未验证',
  [ErrorCodes.INVALID_VERIFY_TOKEN]: '验证链接无效或已过期',
  [ErrorCodes.INVALID_RESET_TOKEN]: '重置密码链接无效或已过期',
  [ErrorCodes.EMAIL_NOT_REGISTERED]: '邮箱未注册',
  [ErrorCodes.USER_NOT_FOUND]: '用户不存在',
  [ErrorCodes.CANNOT_OPERATE_SELF]: '不能操作自己',
  [ErrorCodes.USER_UPDATE_FAILED]: '用户信息更新失败',
  [ErrorCodes.EMAIL_ALREADY_BOUND]: '邮箱已被其他用户绑定',
  [ErrorCodes.GITHUB_ALREADY_BOUND]: 'GitHub 账号已被其他用户绑定',
  [ErrorCodes.POST_NOT_FOUND]: '帖子不存在',
  [ErrorCodes.POST_TITLE_EMPTY]: '标题不能为空',
  [ErrorCodes.POST_TITLE_TOO_LONG]: '标题长度超出限制',
  [ErrorCodes.POST_CONTENT_EMPTY]: '内容不能为空',
  [ErrorCodes.POST_CONTENT_TOO_LONG]: '内容长度超出限制',
  [ErrorCodes.POST_EDIT_FORBIDDEN]: '无权限编辑该帖子',
  [ErrorCodes.POST_DELETE_FORBIDDEN]: '无权限删除该帖子',
  [ErrorCodes.POST_CONTENT_REJECTED]: '内容审核未通过',
  [ErrorCodes.POST_UNDER_REVIEW]: '帖子正在审核中',
  [ErrorCodes.COMMENT_NOT_FOUND]: '评论不存在',
  [ErrorCodes.COMMENT_CONTENT_EMPTY]: '评论内容不能为空',
  [ErrorCodes.COMMENT_CONTENT_TOO_LONG]: '评论内容长度超出限制',
  [ErrorCodes.COMMENT_POST_INVALID]: '帖子不存在或已删除',
  [ErrorCodes.COMMENT_DEPTH_EXCEEDED]: '嵌套深度已达上限',
  [ErrorCodes.COMMENT_PARENT_NOT_FOUND]: '父评论不存在',
  [ErrorCodes.COMMENT_DELETE_FORBIDDEN]: '无权限删除该评论',
  [ErrorCodes.ALREADY_LIKED]: '已点赞',
  [ErrorCodes.NOT_LIKED]: '未点赞',
  [ErrorCodes.LIKE_TARGET_NOT_FOUND]: '点赞目标不存在',
  [ErrorCodes.ALREADY_BOOKMARKED]: '已收藏',
  [ErrorCodes.NOT_BOOKMARKED]: '未收藏',
  [ErrorCodes.BOOKMARK_POST_NOT_FOUND]: '帖子不存在',
  [ErrorCodes.ALREADY_FOLLOWED]: '已关注',
  [ErrorCodes.NOT_FOLLOWED]: '未关注',
  [ErrorCodes.FOLLOW_TARGET_NOT_FOUND]: '目标用户不存在',
  [ErrorCodes.CANNOT_FOLLOW_SELF]: '不能关注自己',
  [ErrorCodes.TAG_NOT_FOUND]: '标签不存在',
  [ErrorCodes.TAG_NAME_TAKEN]: '标签名称已存在',
  [ErrorCodes.TAG_NAME_INVALID]: '标签名称格式不正确',
  [ErrorCodes.TAG_LIMIT_EXCEEDED]: '帖子标签数量超限',
  [ErrorCodes.PROJECT_NOT_FOUND]: '作品不存在',
  [ErrorCodes.PROJECT_TITLE_EMPTY]: '作品名称不能为空',
  [ErrorCodes.PROJECT_LIMIT_EXCEEDED]: '作品数量已达上限',
  [ErrorCodes.PROJECT_OPERATION_FORBIDDEN]: '无权限操作该作品',
  [ErrorCodes.FILE_SIZE_EXCEEDED]: '文件大小超出限制',
  [ErrorCodes.FILE_TYPE_UNSUPPORTED]: '文件类型不支持',
  [ErrorCodes.UPLOAD_CREDENTIAL_FAILED]: '上传凭证获取失败',
  [ErrorCodes.OSS_UPLOAD_FAILED]: 'OSS 上传失败',
  [ErrorCodes.FILE_NOT_FOUND]: '文件不存在',
  [ErrorCodes.NO_UNREAD_NOTIFICATIONS]: '无未读通知',
  [ErrorCodes.SEARCH_KEYWORD_EMPTY]: '搜索关键词不能为空',
  [ErrorCodes.SEARCH_KEYWORD_TOO_SHORT]: '搜索关键词过短',
} as const;
```
