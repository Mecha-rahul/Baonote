import { useState } from 'react'
import api from '../api/axios'

/**
 * Hand-drawn style background lines for the right side.
 * Sits behind the form (z-0, no pointer events). To recolor, change the
 * two stroke values below; to make them stronger or softer, change opacity.
 */
const LINE_MAIN = 'rgb(var(--rgb-accent))' // thick wavy line
const LINE_SOFT = 'rgb(var(--rgb-muted))' // thin curls and big arc

function DecorLines() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      viewBox="0 0 1000 800"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* small curl at the top */}
      <path
        d="M 215 -10 C 205 40 190 85 235 95 C 285 105 300 55 262 38 C 238 28 228 50 245 62"
        stroke={LINE_SOFT}
        strokeWidth="6"
        opacity="0.45"
      />
      {/* long soft loop at the top, runs off the top edge */}
      <path
        d="M 120 -10 C 110 70 170 130 330 120 C 450 112 520 50 505 -10"
        stroke={LINE_SOFT}
        strokeWidth="6"
        opacity="0.35"
      />
      {/* big arc sweeping from the top right down to the bottom middle */}
      <path
        d="M 1010 90 C 1015 420 930 650 640 790 C 600 808 560 812 520 815"
        stroke={LINE_SOFT}
        strokeWidth="6"
        opacity="0.4"
      />
      {/* thick wavy line through the middle right, ending sideways */}
      <path
        d="M 840 -10 C 720 90 840 140 770 230 C 705 315 780 360 900 372 C 960 378 990 370 1020 362"
        stroke={LINE_MAIN}
        strokeWidth="16"
        opacity="0.5"
      />
    </svg>
  )
}

/**
 * Login / Register page.
 * Uses Baonote's real theme tokens (bg-canvas, bg-surface, text-text,
 * text-text-muted, border-border, bg-accent) so it follows light/dark automatically.
 *
 * Props:
 *   onAuthSuccess() - called after the token is saved; App.jsx uses it to show the board.
 */
export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const switchMode = () => {
    setMode(isLogin ? 'register' : 'login')
    setError('')
  }

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    // backend shape: { statusCode, data: { user, accessToken }, message, success }
    localStorage.setItem('accessToken', res.data.data.accessToken)
    onAuthSuccess?.()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        await login(form.email, form.password)
      } else {
        await api.post('/api/auth/register', form)
        // register does not return a token, so log in right after
        await login(form.email, form.password)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30'

  return (
    <div className="flex min-h-screen w-full bg-canvas text-text">
      {/* LEFT: 1/3 of the screen, semicircle edge, logo + name */}
      <aside className="hidden w-1/3 shrink-0 items-center justify-center rounded-r-full border-r border-border bg-surface shadow-panel md:flex">
        <div className="flex flex-col items-center gap-5 pr-12">
          <img
            src="/logo.png"
            alt="Baonote"
            className="h-32 w-32 rounded-3xl object-cover shadow-pop"
          />
          <h1 className="text-4xl font-semibold tracking-tight">Baonote</h1>
          <p className="max-w-[230px] text-center text-sm text-text-muted">
            A creative planning workspace for developers and students.
          </p>
        </div>
      </aside>

      {/* RIGHT: form, centered in the remaining 2/3 so it sits right of true center */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6">
        <DecorLines />
        <div className="relative z-10 w-full max-w-sm">
          {/* logo only on mobile, where the left panel is hidden */}
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <img src="/logo.png" alt="" className="h-10 w-10 rounded-xl object-cover" />
            <span className="text-2xl font-semibold">Baonote</span>
          </div>

          <h2 className="text-2xl font-semibold">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mb-8 mt-1 text-sm text-text-muted">
            {isLogin
              ? 'Log in to continue to your boards.'
              : 'Start planning your projects in minutes.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
                className={inputClass}
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className={inputClass}
            />

            <input
              type="password"
              name="password"
              placeholder="Password (min 8 characters)"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              className={inputClass}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="font-medium text-accent hover:underline"
            >
              {isLogin ? 'Register' : 'Log in'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}