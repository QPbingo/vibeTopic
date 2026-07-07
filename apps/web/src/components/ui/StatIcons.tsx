interface StatIconsProps {
  likeCount: number
  commentCount: number
  bookmarkCount: number
  isLiked?: boolean
  isBookmarked?: boolean
  onLike?: () => void
  onBookmark?: () => void
}

export function StatIcons({
  likeCount, commentCount, bookmarkCount,
  isLiked, isBookmarked, onLike, onBookmark,
}: StatIconsProps) {
  return (
    <div className="post-card-stats">
      <button
        type="button"
        className="stat-like"
        onClick={onLike}
        disabled={!onLike}
        aria-label={isLiked ? `取消点赞，当前 ${likeCount} 个赞` : `点赞，当前 ${likeCount} 个赞`}
        aria-pressed={isLiked}
        style={{ cursor: onLike ? 'pointer' : 'default', border: 'none', background: isLiked ? 'rgba(244,63,94,0.25)' : 'rgba(244,63,94,0.1)' }}
      >
        {isLiked ? '♥' : '♡'} {likeCount}
      </button>
      <span className="stat-comment">
        ◆ {commentCount}
      </span>
      <button
        type="button"
        className="stat-bookmark"
        onClick={onBookmark}
        disabled={!onBookmark}
        aria-label={isBookmarked ? `取消收藏，当前 ${bookmarkCount} 个收藏` : `收藏，当前 ${bookmarkCount} 个收藏`}
        aria-pressed={isBookmarked}
        style={{ cursor: onBookmark ? 'pointer' : 'default', border: 'none', background: isBookmarked ? 'rgba(168,85,247,0.25)' : 'rgba(168,85,247,0.1)' }}
      >
        {isBookmarked ? '★' : '☆'} {bookmarkCount}
      </button>
    </div>
  )
}
