/* User-uploaded media dimensions are intentionally controlled by the pixel grid CSS. */
/* eslint-disable @next/next/no-img-element */
import type { PostMedia as PostMediaType } from '@bingo/shared'

interface PostMediaProps {
  media: PostMediaType[]
}

export function PostMedia({ media }: PostMediaProps) {
  if (media.length === 0) return null

  // Video
  const firstVideo = media.find(m => m.type === 'video')
  if (firstVideo) {
    return (
      <div className="post-media post-media-video">
        <div
          className={`media-img media-ph-4`}
          style={{ height: 160 }}
        />
        <div className="video-play-overlay">
          <div className="video-play-btn" />
        </div>
        {firstVideo.duration && (
          <span className="video-duration">{firstVideo.duration}</span>
        )}
      </div>
    )
  }

  // Images
  const images = media.filter(m => m.type === 'image')
  if (images.length === 1) {
    return (
      <div className="post-media post-media-single">
        {images[0]!.url ? (
          <img src={images[0]!.url} alt="" className="media-img" />
        ) : (
          <div className={`media-img media-ph-${images[0]!.placeholderType || '1'}`} />
        )}
      </div>
    )
  }

  if (images.length >= 2) {
    const colClass = images.length === 2 ? 'col2' : 'col3'
    return (
      <div className={`post-media post-media-grid ${colClass}`}>
        {images.slice(0, 3).map((img, i) => (
          img.url ? (
            <img key={i} src={img.url} alt="" className="media-img" />
          ) : (
            <div key={i} className={`media-img media-ph-${img.placeholderType || ((i % 6) + 1)}`} />
          )
        ))}
        {images.length >= 2 && (
          <span className="media-count-badge">{images.length} 张</span>
        )}
      </div>
    )
  }

  return null
}
