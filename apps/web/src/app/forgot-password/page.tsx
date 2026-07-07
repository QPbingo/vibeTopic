import { ForgotPasswordForm } from '@/components/auth/PasswordResetForms'

export const metadata = {
  title: '忘记密码 — bingbingbingo',
}

export default function ForgotPasswordPage() {
  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 20px' }}>
      <ForgotPasswordForm />
    </div>
  )
}
