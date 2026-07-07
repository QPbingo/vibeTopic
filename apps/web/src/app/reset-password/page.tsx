import { ResetPasswordForm } from '@/components/auth/PasswordResetForms'

export const metadata = {
  title: '重置密码 — bingbingbingo',
}

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams
  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 20px' }}>
      <ResetPasswordForm token={token} />
    </div>
  )
}
