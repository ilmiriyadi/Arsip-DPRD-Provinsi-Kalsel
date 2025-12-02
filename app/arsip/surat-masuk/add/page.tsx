'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Save, X, FileText, Hash, Calendar, Building, MessageSquare, AlertCircle } from 'lucide-react'
import { csrfFetch } from '@/lib/csrfFetch'

export default function AddSuratMasukPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    noUrut: '',
    nomorSurat: '',
    tanggalSurat: '',
    tanggalDiteruskan: '',
    asalSurat: '',
    perihal: '',
    keterangan: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/arsip/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/arsip/dashboard')
    }
  }, [status, session, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await csrfFetch('/api/surat-masuk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          noUrut: parseInt(formData.noUrut),
          tanggalSurat: new Date(formData.tanggalSurat).toISOString(),
          tanggalDiteruskan: new Date(formData.tanggalDiteruskan).toISOString(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/arsip/surat-masuk')
      } else {
        setError(data.error || 'Terjadi kesalahan saat menyimpan surat')
      }
    } catch (error) {
      console.error('Error saving surat masuk:', error)
      setError('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F7F7F7] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C8A348]/20 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#B82025] border-t-transparent absolute top-0 left-1/2 -ml-8"></div>
          </div>
          <p className="mt-6 text-[#1A1A1A] font-semibold text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>Memuat formulir...</p>
          <p className="mt-2 text-[#737373] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Mohon tunggu sebentar</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header with Borneo Design and Decorative Elements */}
      <div className="bg-gradient-to-r from-[#B82025] to-[#8B1A1F] shadow-lg relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C8A348] rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 py-3 text-sm text-white/80" style={{ fontFamily: 'Inter, sans-serif' }}>
            <Link href="/arsip/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <span>/</span>
            <Link href="/arsip/surat-masuk" className="hover:text-white transition-colors">Surat Masuk</Link>
            <span>/</span>
            <span className="text-white font-medium">Tambah Baru</span>
          </div>
          
          <div className="flex justify-between items-center pb-6">
            <div className="flex items-center space-x-4">
              {/* Icon Box with backdrop blur */}
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Merriweather, serif' }}>
                  Tambah Surat Masuk
                </h1>
                <p className="mt-2 text-sm text-white/90" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Tambahkan dokumen surat masuk baru ke dalam sistem arsip digital
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="civic-card bg-white shadow-xl rounded-2xl border border-[#E3E3E3] overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="bg-[#F7F7F7] px-6 py-3 border-b border-[#E3E3E3]">
              <h3 className="text-xl font-semibold text-[#1A1A1A]" style={{ fontFamily: 'Merriweather, serif' }}>
                Informasi Detail Surat
              </h3>
              <p className="text-sm text-[#737373] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Lengkapi formulir di bawah ini dengan data yang akurat
              </p>
            </div>

            <div className="p-5 space-y-5">
              {error && (
                <div className="bg-red-50 border-l-4 border-[#B82025] text-red-900 px-6 py-4 rounded-lg shadow-sm">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-[#B82025]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label htmlFor="noUrut" className="flex items-center space-x-2 text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div className="w-6 h-6 bg-[#C8A348]/10 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all">
                      <Hash className="h-3.5 w-3.5 text-[#C8A348]" />
                    </div>
                    <span>No Urut <span className="text-[#B82025]">*</span></span>
                  </label>
                  <input
                    type="number"
                    id="noUrut"
                    name="noUrut"
                    value={formData.noUrut}
                    onChange={handleChange}
                    required
                    min="1"
                    className="civic-input w-full px-4 py-3.5 border border-[#E3E3E3] rounded-xl bg-white focus:ring-2 focus:ring-[#B82025] focus:border-transparent civic-transition text-[#1A1A1A] shadow-sm hover:shadow-md"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    placeholder="Contoh: 1, 2, 3..."
                  />
                  <p className="mt-2 text-xs text-[#737373] flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Nomor urut surat secara berurutan
                  </p>
                </div>
                
                <div className="group">
                  <label htmlFor="nomorSurat" className="flex items-center space-x-2 text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div className="w-6 h-6 bg-[#B82025]/10 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all">
                      <FileText className="h-3.5 w-3.5 text-[#B82025]" />
                    </div>
                    <span>Nomor Surat <span className="text-[#737373] font-normal">(Opsional)</span></span>
                  </label>
                  <input
                    type="text"
                    id="nomorSurat"
                    name="nomorSurat"
                    value={formData.nomorSurat}
                    onChange={handleChange}
                    className="civic-input w-full px-4 py-3.5 border border-[#E3E3E3] rounded-xl bg-white focus:ring-2 focus:ring-[#B82025] focus:border-transparent civic-transition text-[#1A1A1A] placeholder-[#737373] shadow-sm hover:shadow-md"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    placeholder="Contoh: 001/SKM/X/2024"
                  />
                  <p className="mt-2 text-xs text-[#737373] flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Nomor resmi surat jika tersedia
                  </p>
                </div>

                <div className="group">
                  <label htmlFor="tanggalSurat" className="flex items-center space-x-2 text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div className="w-6 h-6 bg-[#C8A348]/10 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all">
                      <Calendar className="h-3.5 w-3.5 text-[#C8A348]" />
                    </div>
                    <span>Tanggal Surat <span className="text-[#B82025]">*</span></span>
                  </label>
                  <input
                    type="date"
                    id="tanggalSurat"
                    name="tanggalSurat"
                    value={formData.tanggalSurat}
                    onChange={handleChange}
                    required
                    className="civic-input w-full px-4 py-3.5 border border-[#E3E3E3] rounded-xl bg-white focus:ring-2 focus:ring-[#B82025] focus:border-transparent civic-transition text-[#1A1A1A] shadow-sm hover:shadow-md"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                <div className="group">
                  <label htmlFor="tanggalDiteruskan" className="flex items-center space-x-2 text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div className="w-6 h-6 bg-[#B82025]/10 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all">
                      <Calendar className="h-3.5 w-3.5 text-[#B82025]" />
                    </div>
                    <span>Tanggal Diteruskan <span className="text-[#B82025]">*</span></span>
                  </label>
                  <input
                    type="date"
                    id="tanggalDiteruskan"
                    name="tanggalDiteruskan"
                    value={formData.tanggalDiteruskan}
                    onChange={handleChange}
                    required
                    className="civic-input w-full px-4 py-3.5 border border-[#E3E3E3] rounded-xl bg-white focus:ring-2 focus:ring-[#B82025] focus:border-transparent civic-transition text-[#1A1A1A] shadow-sm hover:shadow-md"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="asalSurat" className="flex items-center space-x-2 text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="w-6 h-6 bg-[#C8A348]/10 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all">
                    <Building className="h-3.5 w-3.5 text-[#C8A348]" />
                  </div>
                  <span>Asal Surat <span className="text-[#B82025]">*</span></span>
                </label>
                <input
                  type="text"
                  id="asalSurat"
                  name="asalSurat"
                  value={formData.asalSurat}
                  onChange={handleChange}
                  required
                  className="civic-input w-full px-4 py-3.5 border border-[#E3E3E3] rounded-xl bg-white focus:ring-2 focus:ring-[#B82025] focus:border-transparent civic-transition text-[#1A1A1A] shadow-sm hover:shadow-md"
                  placeholder="Contoh: Dinas Pendidikan Kota Jakarta"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <p className="mt-2 text-xs text-[#737373] flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Nama instansi atau organisasi pengirim surat
                </p>
              </div>

              <div className="group">
                <label htmlFor="perihal" className="flex items-center space-x-2 text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="w-6 h-6 bg-[#B82025]/10 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all">
                    <MessageSquare className="h-3.5 w-3.5 text-[#B82025]" />
                  </div>
                  <span>Perihal <span className="text-[#B82025]">*</span></span>
                </label>
                <input
                  type="text"
                  id="perihal"
                  name="perihal"
                  value={formData.perihal}
                  onChange={handleChange}
                  required
                  className="civic-input w-full px-4 py-3.5 border border-[#E3E3E3] rounded-xl bg-white focus:ring-2 focus:ring-[#B82025] focus:border-transparent civic-transition text-[#1A1A1A] shadow-sm hover:shadow-md"
                  placeholder="Contoh: Undangan Rapat Koordinasi"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <p className="mt-2 text-xs text-[#737373] flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Isi atau topik utama surat
                </p>
              </div>

              <div className="group">
                <label htmlFor="keterangan" className="flex items-center space-x-2 text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="w-6 h-6 bg-[#C8A348]/10 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all">
                    <MessageSquare className="h-3.5 w-3.5 text-[#C8A348]" />
                  </div>
                  <span>Keterangan <span className="text-[#737373] text-xs">(Opsional)</span></span>
                </label>
                <textarea
                  id="keterangan"
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleChange}
                  rows={4}
                  className="civic-input w-full px-4 py-3.5 border border-[#E3E3E3] rounded-xl bg-white focus:ring-2 focus:ring-[#B82025] focus:border-transparent civic-transition text-[#1A1A1A] shadow-sm hover:shadow-md resize-none"
                  placeholder="Catatan atau keterangan tambahan (opsional)"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <p className="mt-2 text-xs text-[#737373] flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Informasi tambahan yang perlu dicatat
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E3E3E3] flex justify-end space-x-3 bg-[#F7F7F7] rounded-b-2xl">
              <Link
                href="/arsip/surat-masuk"
                className="civic-btn-secondary inline-flex items-center px-5 py-3 border-2 border-[#E3E3E3] rounded-xl shadow-sm text-sm font-semibold text-[#1A1A1A] bg-white hover:bg-[#F7F7F7] hover:shadow-md transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="civic-btn-primary inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-[#B82025] hover:bg-[#8B1A1F] hover:shadow-lg focus:ring-2 focus:ring-[#B82025] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Menyimpan...' : 'Simpan Surat'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}




