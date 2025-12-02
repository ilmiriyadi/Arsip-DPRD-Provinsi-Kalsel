"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ArrowLeft, Building2, Shield } from 'lucide-react'

export default function ArsipLoginPage() {
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
      
      if (userData.role !== 'ADMIN') {
        setError('Akun tidak memiliki akses ke sistem arsip')
        // Sign out the user since they don't have access
        await signIn('credentials', {
          email: '',
          password: '',
          redirect: false,
        })
        return
      }
      
      router.push('/arsip/dashboard')
    } catch {
      setError('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B82025] via-[#8B1A1F] to-[#1A1A1A] flex items-center justify-center py-8 px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="grid grid-cols-12 gap-4 opacity-20">
            {[...Array(144)].map((_, i) => (
              <div key={i} className="aspect-square border border-white/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:block text-white space-y-12 px-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="w-28 h-28 bg-white/10 backdrop-blur-lg rounded-3xl flex items-center justify-center border border-white/20">
                <Building2 className="w-16 h-16 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold" style={{ fontFamily: 'Merriweather, serif' }}>Arsip Surat</h1>
                <p className="text-white/90 text-2xl mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>DPRD Kalimantan Selatan</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl font-bold leading-tight" style={{ fontFamily: 'Merriweather, serif' }}>
              Sistem Manajemen Arsip<br />Surat Digital
            </h2>
            <p className="text-white/90 text-xl leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Platform terintegrasi untuk mengelola surat masuk, surat keluar, dan disposisi dengan efisien dan terorganisir.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-5">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-xl" style={{ fontFamily: 'Inter, sans-serif' }}>Aman & Terpercaya</h3>
                <p className="text-white/70 text-base" style={{ fontFamily: 'Inter, sans-serif' }}>Data terenkripsi dengan standar keamanan tinggi</p>
              </div>
            </div>
            <div className="flex items-start space-x-5">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">⚡</span>
              </div>
              <div>
                <h3 className="font-semibold text-xl" style={{ fontFamily: 'Inter, sans-serif' }}>Cepat & Efisien</h3>
                <p className="text-white/70 text-base" style={{ fontFamily: 'Inter, sans-serif' }}>Akses dan kelola dokumen dalam hitungan detik</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-lg mx-auto lg:mx-0">
          <div className="bg-white rounded-3xl shadow-2xl p-10 lg:p-12 relative">
            {/* Back Button */}
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 text-base font-semibold text-[#737373] bg-[#F7F7F7] rounded-xl hover:bg-[#E3E3E3] civic-transition mb-10"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>

            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-[#B82025] to-[#8B1A1F] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Merriweather, serif' }}>Selamat Datang</h1>
              <p className="text-[#737373] text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>Login ke Sistem Arsip Surat</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              {error && (
                <div className="bg-red-50 border-l-4 border-[#B82025] text-[#B82025] px-4 py-3 rounded-lg text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-base font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="civic-input w-full px-5 py-4 text-lg"
                  placeholder="contoh@gmail.com"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-base font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="civic-input w-full px-5 pr-14 py-4 text-lg"
                    placeholder="Masukkan password"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-[#737373] hover:text-[#1A1A1A] civic-transition"
                  >
                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="civic-btn-primary w-full py-5 px-6 rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {loading ? 'Mengautentikasi...' : 'Login ke Dashboard'}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-[#E3E3E3] text-center">
              <p className="text-base text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Untuk akses Surat Tamu,{' '}
                <Link href="/tamu/login" className="text-[#B82025] hover:text-[#1A1A1A] font-semibold civic-transition">
                  klik disini
                </Link>
              </p>
            </div>
          </div>

          {/* Mobile Branding */}
          <div className="lg:hidden mt-10 text-center text-white">
            <p className="text-white/90 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
              Sistem Manajemen Arsip Surat Digital
            </p>
            <p className="text-white/70 text-base mt-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              DPRD Provinsi Kalimantan Selatan
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

