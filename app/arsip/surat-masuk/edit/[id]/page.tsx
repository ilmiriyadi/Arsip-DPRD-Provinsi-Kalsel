'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use, useCallback } from 'react'
import Link from 'next/link'
import { Save, X, ArrowLeft, FileText } from 'lucide-react'
import { csrfFetch } from '@/lib/csrfFetch'

interface SuratMasuk {
  id: string
  nomorSurat: string | null
  tanggalSurat: string
  tanggalDiteruskan: string
  asalSurat: string
  perihal: string
  keterangan?: string
  filePath?: string
  createdBy: {
    id: string
    name: string
    email: string
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditSuratMasukPage({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [surat, setSurat] = useState<SuratMasuk | null>(null)
  const resolvedParams = use(params)
  const [formData, setFormData] = useState({
    nomorSurat: '',
    tanggalSurat: '',
    tanggalDiteruskan: '',
    asalSurat: '',
    perihal: '',
    keterangan: '',
    filePath: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/arsip/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/arsip/dashboard')
    }
  }, [status, session, router])

  const fetchSuratData = useCallback(async () => {
    try {
      setFetchLoading(true)
      const response = await csrfFetch(`/api/surat-masuk/${resolvedParams.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setSurat(data)
        
        // Pre-fill form with existing data
        setFormData({
          nomorSurat: data.nomorSurat || '',
          tanggalSurat: new Date(data.tanggalSurat).toISOString().split('T')[0],
          tanggalDiteruskan: new Date(data.tanggalDiteruskan).toISOString().split('T')[0],
          asalSurat: data.asalSurat,
          perihal: data.perihal,
          keterangan: data.keterangan || '',
          filePath: data.filePath || ''
        })
      } else if (response.status === 404) {
        setError('Surat masuk tidak ditemukan')
      } else {
        setError('Gagal mengambil data surat masuk')
      }
    } catch (error) {
      console.error('Error fetching surat data:', error)
      setError('Terjadi kesalahan sistem')
    } finally {
      setFetchLoading(false)
    }
  }, [resolvedParams.id])

  useEffect(() => {
    if (session && resolvedParams.id) {
      fetchSuratData()
    }
  }, [session, resolvedParams.id, fetchSuratData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await csrfFetch(`/api/surat-masuk/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tanggalSurat: new Date(formData.tanggalSurat).toISOString(),
          tanggalDiteruskan: new Date(formData.tanggalDiteruskan).toISOString(),
        }),
      })

      if (response.ok) {
        router.push('/arsip/surat-masuk')
      } else {
        const data = await response.json()
        setError(data.error || 'Terjadi kesalahan saat mengupdate surat masuk')
      }
    } catch (error) {
      console.error('Error updating surat masuk:', error)
      setError('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F7F7F7] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B82025] mx-auto"></div>
          <p className="mt-4 text-[#1A1A1A]" style={{ fontFamily: 'Inter, sans-serif' }}>Memuat...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  if (error && !surat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F7F7F7] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#B82025] text-lg font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>{error}</div>
          <div className="mt-4">
            <Link
              href="/arsip/surat-masuk"
              className="civic-btn-primary inline-flex items-center px-6 py-3 border border-transparent shadow-md text-sm font-semibold rounded-xl text-white bg-[#B82025] hover:bg-[#8B1A1F] hover:shadow-lg transition-all"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F7F7] to-white">
      {/* Header with Decorative Background */}
      <div className="relative bg-gradient-to-r from-[#B82025] to-[#8B1A1F] shadow-lg overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm mb-4">
              <Link href="/arsip/dashboard" className="text-white/70 hover:text-white transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                Dashboard
              </Link>
              <span className="text-white/50">/</span>
              <Link href="/arsip/surat-masuk" className="text-white/70 hover:text-white transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                Surat Masuk
              </Link>
              <span className="text-white/50">/</span>
              <span className="text-white font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Edit</span>
            </nav>

            {/* Title Section */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {/* Icon Box */}
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                
                {/* Title and Description */}
                <div>
                  <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Merriweather, serif' }}>
                    Edit Surat Masuk
                  </h1>
                  <p className="mt-2 text-sm text-white/90" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Perbarui informasi surat masuk yang sudah ada di sistem
                  </p>
                </div>
              </div>

              {/* Back Button */}
              <Link
                href="/arsip/surat-masuk"
                className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all shadow-lg hover:shadow-xl"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="civic-card bg-white shadow-xl rounded-2xl border border-[#E3E3E3]">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-3 border-b border-[#E3E3E3] bg-[#F7F7F7] rounded-t-2xl">
              <h3 className="text-lg font-semibold text-[#1A1A1A]" style={{ fontFamily: 'Merriweather, serif' }}>
                Informasi Surat Masuk
              </h3>
            </div>

            <div className="p-5 space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-[#B82025] text-[#B82025] px-4 py-3 rounded-r-xl text-sm shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nomorSurat" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Nomor Surat <span className="text-[#737373]">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    id="nomorSurat"
                    name="nomorSurat"
                    value={formData.nomorSurat}
                    onChange={handleChange}
                    className="civic-input w-full px-3 py-2 border border-[#E3E3E3] rounded-xl focus:ring-2 focus:ring-[#B82025] focus:border-transparent text-[#1A1A1A] shadow-sm hover:shadow-md transition-shadow"
                    placeholder="Contoh: SM/001/X/2024"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                <div>
                  <label htmlFor="tanggalSurat" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Tanggal Surat <span className="text-[#B82025]">*</span>
                  </label>
                  <input
                    type="date"
                    id="tanggalSurat"
                    name="tanggalSurat"
                    value={formData.tanggalSurat}
                    onChange={handleChange}
                    required
                    className="civic-input w-full px-3 py-2 border border-[#E3E3E3] rounded-xl focus:ring-2 focus:ring-[#B82025] focus:border-transparent text-[#1A1A1A] shadow-sm hover:shadow-md transition-shadow"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                <div>
                  <label htmlFor="tanggalDiteruskan" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Tanggal Diteruskan <span className="text-[#B82025]">*</span>
                  </label>
                  <input
                    type="date"
                    id="tanggalDiteruskan"
                    name="tanggalDiteruskan"
                    value={formData.tanggalDiteruskan}
                    onChange={handleChange}
                    required
                    className="civic-input w-full px-3 py-2 border border-[#E3E3E3] rounded-xl focus:ring-2 focus:ring-[#B82025] focus:border-transparent text-[#1A1A1A] shadow-sm hover:shadow-md transition-shadow"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="asalSurat" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Asal Surat <span className="text-[#B82025]">*</span>
                </label>
                <input
                  type="text"
                  id="asalSurat"
                  name="asalSurat"
                  value={formData.asalSurat}
                  onChange={handleChange}
                  required
                  className="civic-input w-full px-3 py-2 border border-[#E3E3E3] rounded-xl focus:ring-2 focus:ring-[#B82025] focus:border-transparent text-[#1A1A1A] shadow-sm hover:shadow-md transition-shadow"
                  placeholder="Contoh: Dinas Pendidikan Kota"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div>
                <label htmlFor="perihal" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Perihal <span className="text-[#B82025]">*</span>
                </label>
                <textarea
                  id="perihal"
                  name="perihal"
                  value={formData.perihal}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="civic-input w-full px-3 py-2 border border-[#E3E3E3] rounded-xl focus:ring-2 focus:ring-[#B82025] focus:border-transparent text-[#1A1A1A] shadow-sm hover:shadow-md transition-shadow resize-none"
                  placeholder="Jelaskan perihal atau subjek surat..."
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div>
                <label htmlFor="keterangan" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Keterangan
                </label>
                <textarea
                  id="keterangan"
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleChange}
                  rows={2}
                  className="civic-input w-full px-3 py-2 border border-[#E3E3E3] rounded-xl focus:ring-2 focus:ring-[#B82025] focus:border-transparent text-[#1A1A1A] shadow-sm hover:shadow-md transition-shadow resize-none"
                  placeholder="Catatan atau keterangan tambahan (opsional)"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div>
                <label htmlFor="filePath" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Path File
                </label>
                <input
                  type="text"
                  id="filePath"
                  name="filePath"
                  value={formData.filePath}
                  onChange={handleChange}
                  className="civic-input w-full px-3 py-2 border border-[#E3E3E3] rounded-xl focus:ring-2 focus:ring-[#B82025] focus:border-transparent text-[#1A1A1A] shadow-sm hover:shadow-md transition-shadow"
                  placeholder="Path file dokumen surat (opsional)"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              {surat && (
                <div className="bg-gradient-to-r from-[#F7F7F7] to-[#FAFAFA] p-3 rounded-xl border border-[#E3E3E3]">
                  <h4 className="text-sm font-semibold text-[#1A1A1A] mb-1" style={{ fontFamily: 'Merriweather, serif' }}>Informasi Tambahan</h4>
                  <p className="text-sm text-[#1A1A1A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Dibuat oleh: <span className="font-semibold text-[#B82025]">{surat.createdBy.name}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-[#E3E3E3] flex justify-end space-x-3 bg-[#F7F7F7] rounded-b-2xl">
              <Link
                href="/arsip/surat-masuk"
                className="civic-btn-secondary inline-flex items-center px-4 py-2 border-2 border-[#E3E3E3] rounded-xl shadow-sm text-sm font-semibold text-[#1A1A1A] bg-white hover:bg-[#F7F7F7] hover:shadow-md transition-all"
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
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}