import { PostEditorForm } from '@/components/posts/PostEditorForm'

export const metadata = {
  title: '发布帖子 — bingbingbingo',
}

export default function NewPostPage() {
  return <PostEditorForm mode="create" />
}
