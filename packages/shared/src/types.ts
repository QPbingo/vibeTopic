// ============================================================
// bingbingbingo — Shared TypeScript Types
// ============================================================

// ---- Base API Response ----
export interface ApiResponse<T = unknown> {
  code: number
  data: T | null
  message: string
}

// ---- Pagination ----
export interface PaginatedResponse<T> {
  items: T[]
  cursor: string | null
  hasMore: boolean
}

export interface PaginationParams {
  cursor?: string
  limit?: number
}

// ---- User ----
export type UserRole = 'user' | 'admin'
export type UserStatus = 'active' | 'banned' | 'deleted'

export interface User {
  id: string
  username: string
  email?: string // only returned for self
  avatarUrl: string | null
  bio: string | null
  githubUsername: string | null
  githubUrl: string | null
  role: UserRole
  status: UserStatus
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  followerCount: number
  followingCount: number
  projectCount: number
  postCount: number
  isFollowing?: boolean // whether current user follows this user
}

export interface UserUpdateInput {
  username?: string
  bio?: string
  avatarUrl?: string
}

// ---- Auth ----
export interface RegisterInput {
  username: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  expiresIn: number
}

export interface ResetPasswordInput {
  token: string
  password: string
}

// ---- Post ----
export type PostStatus = 'pending_review' | 'published' | 'rejected' | 'hidden' | 'deleted'

export interface Post {
  id: string
  title: string
  contentMd: string
  contentHtml: string
  slug: string
  userId: string
  status: PostStatus
  viewCount: number
  likeCount: number
  commentCount: number
  bookmarkCount: number
  isPinned: boolean
  editedAt: string | null
  createdAt: string
  updatedAt: string
  // joined fields
  author?: Pick<User, 'id' | 'username' | 'avatarUrl'>
  tags?: Tag[]
  isLiked?: boolean
  isBookmarked?: boolean
}

export interface PostCard {
  id: string
  title: string
  slug: string
  excerpt: string // first 200 chars of content_md
  status: PostStatus
  likeCount: number
  commentCount: number
  bookmarkCount: number
  viewCount: number
  isPinned: boolean
  createdAt: string
  author: {
    id: string
    username: string
    avatarUrl: string | null
  }
  tags: Tag[]
  isLiked?: boolean
  isBookmarked?: boolean
  media?: PostMedia[]
}

export interface PostMedia {
  type: 'image' | 'video'
  url: string
  placeholderType?: string // media-ph-1 ~ media-ph-6
  duration?: string // video duration like "24:18"
  isLive?: boolean
}

export interface CreatePostInput {
  title: string
  contentMd: string
  contentHtml?: string
  tags?: string[] // tag names
  media?: PostMedia[]
}

export interface UpdatePostInput {
  title?: string
  contentMd?: string
  contentHtml?: string
  tags?: string[]
}

export type FeedSort = 'latest' | 'hot' | 'featured'

// ---- Comment ----
export type CommentStatus = 'published' | 'hidden' | 'deleted'

export interface Comment {
  id: string
  postId: string
  userId: string
  parentId: string | null
  rootId: string | null
  contentMd: string
  contentHtml: string
  depth: number
  status: CommentStatus
  likeCount: number
  editedAt: string | null
  createdAt: string
  updatedAt: string
  // joined
  author?: Pick<User, 'id' | 'username' | 'avatarUrl'>
  isLiked?: boolean
  replies?: Comment[]
}

export interface CreateCommentInput {
  contentMd: string
  contentHtml?: string
  parentId?: string
}

// ---- Tag ----
export interface Tag {
  id: string
  name: string
  slug: string
  description: string | null
  isOfficial: boolean
  postCount: number
  createdAt: string
}

export interface TagDetail extends Tag {
  posts: PaginatedResponse<PostCard>
}

// ---- Notification ----
export type NotificationType = 'like' | 'comment' | 'reply' | 'bookmark' | 'follow' | 'system'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  actorId: string | null
  targetType: string | null
  targetId: string | null
  content: string | null
  isRead: boolean
  createdAt: string
  // joined
  actor?: Pick<User, 'id' | 'username' | 'avatarUrl'> | null
}

// ---- Project ----
export type ProjectSourceType = 'manual' | 'github' | 'deploy'
export type ProjectStatus = 'published' | 'hidden'

export interface Project {
  id: string
  userId: string
  title: string
  description: string | null
  coverImage: string | null
  images: string[]
  sourceType: ProjectSourceType
  sourceUrl: string | null
  sourceMeta: Record<string, unknown>
  sortOrder: number
  status: ProjectStatus
  createdAt: string
  updatedAt: string
}

export interface CreateProjectInput {
  title: string
  description?: string
  coverImage?: string
  images?: string[]
  sourceUrl?: string
}

export interface UpdateProjectInput {
  title?: string
  description?: string
  coverImage?: string
  images?: string[]
  sourceUrl?: string
  sortOrder?: number
}

// ---- Follow ----
export interface FollowRelation {
  followerId: string
  followeeId: string
  createdAt: string
}

// ---- Search ----
export interface SearchResult {
  posts: PaginatedResponse<PostCard>
  query: string
}

// ---- Upload ----
export interface UploadCredential {
  accessKeyId: string
  accessKeySecret: string
  securityToken: string
  region: string
  bucket: string
  endpoint: string
  cdnDomain: string
  uploadPath: string
  expiration: string
}

// ---- SSE ----
export interface SSETicket {
  ticket: string
  expiresIn: number
  sseUrl: string
}

// ---- SSE Event (sent to client) ----
export interface SSENotificationEvent {
  type: 'notification'
  data: Notification
}
