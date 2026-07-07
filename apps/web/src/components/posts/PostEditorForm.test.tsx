// @vitest-environment jsdom
import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PostEditorForm } from './PostEditorForm'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
  authState: {
    isAuthenticated: true,
    isLoading: false,
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}))

vi.mock('../../lib/api', () => ({
  api: { post: mocks.apiPost, patch: mocks.apiPatch },
}))

vi.mock('../../lib/auth', () => ({
  useAuth: () => mocks.authState,
}))

vi.mock('@bytemd/react', () => ({
  Editor: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea
      aria-label="Markdown 内容"
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  ),
}))

describe('PostEditorForm', () => {
  afterEach(() => cleanup())

  beforeEach(() => {
    mocks.push.mockReset()
    mocks.replace.mockReset()
    mocks.apiPost.mockReset()
    mocks.apiPatch.mockReset()
    mocks.authState = { isAuthenticated: true, isLoading: false }
  })

  it('redirects guests to login with the editor path as next', async () => {
    mocks.authState = { isAuthenticated: false, isLoading: false }

    render(<PostEditorForm mode="create" />)

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/login?next=%2Fposts%2Fnew'))
  })

  it('creates a post from title, markdown, and comma separated tags', async () => {
    mocks.apiPost.mockResolvedValue({ data: { slug: 'hello-world' } })

    render(<PostEditorForm mode="create" />)

    fireEvent.change(screen.getByLabelText('标题'), { target: { value: 'Hello World' } })
    fireEvent.change(screen.getByLabelText('Markdown 内容'), { target: { value: '## Ship it' } })
    fireEvent.change(screen.getByLabelText('标签'), { target: { value: 'Codex, AI, Codex' } })
    fireEvent.click(screen.getByRole('button', { name: '发布帖子' }))

    await waitFor(() => {
      expect(mocks.apiPost).toHaveBeenCalledWith('/posts', {
        title: 'Hello World',
        contentMd: '## Ship it',
        tags: ['Codex', 'AI'],
      })
    })
    expect(mocks.push).toHaveBeenCalledWith('/posts/hello-world')
  })

  it('saves edits to the existing post id', async () => {
    mocks.apiPatch.mockResolvedValue({ data: { slug: 'edited-post' } })
    mocks.apiPost.mockResolvedValue({ data: { slug: 'edited-post' } })

    render(
      <PostEditorForm
        mode="edit"
        initialPost={{
          id: 'post-1',
          title: 'Old title',
          contentMd: 'Old body',
          tags: [{ name: 'OldTag' }],
        }}
      />,
    )

    fireEvent.change(screen.getByLabelText('标题'), { target: { value: 'Edited title' } })
    fireEvent.change(screen.getByLabelText('Markdown 内容'), { target: { value: 'Edited body' } })
    fireEvent.click(screen.getByRole('button', { name: '保存修改' }))

    await waitFor(() => {
      expect(mocks.apiPatch).toHaveBeenCalledWith('/posts/post-1', {
        title: 'Edited title',
        contentMd: 'Edited body',
        tags: ['OldTag'],
      })
    })
    expect(mocks.apiPost).toHaveBeenCalledWith('/posts/post-1/resubmit')
    expect(mocks.push).toHaveBeenCalledWith('/posts/edited-post')
  })
})
