"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function TamuLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email atau password salah')
        return
      }

      // Check user role via API
      const userCheck = await fetch('/api/auth/check-role')
      const userData = await userCheck.json()
      
      if (userData.role !== 'MEMBER') {
        setError('Akun tidak memiliki akses ke sistem tamu')
        // Sign out the user since they don't have access
        await signIn('credentials', {
          email: '',
          password: '',
          redirect: false,
        })
        return
      }
      
      router.push('/tamu/dashboard')
    } catch {
      setError('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4">
      <div className="max-w-md w-full civic-card civic-transition">
        <div className="flex justify-between items-center mb-8">
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-[#737373] bg-white border-2 border-[#E3E3E3] rounded-lg hover:border-[#B82025] civic-transition"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            ← Kembali ke Beranda
          </Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Merriweather, serif' }}>Surat Tamu</h1>
          <p className="text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>Silakan login untuk mengelola Surat Tamu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-[#B82025] text-[#B82025] px-4 py-3 rounded-md text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#1A1A1A] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Email</label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="civic-input w-full px-4 py-3"
                placeholder="masukkan@email.com"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#1A1A1A] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="civic-input w-full px-4 pr-12 py-3"
                placeholder="Masukkan password"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 h-5 w-5 text-[#737373] hover:text-[#1A1A1A] civic-transition"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="civic-btn-primary w-full py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {loading ? 'Mengautentikasi...' : 'Login'}
          </button>
        </form>


      </div>
    </div>
  )
}
