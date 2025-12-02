'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Save, X, Hash, FileText, Calendar, Building, MessageSquare, AlertCircle, Users } from 'lucide-react'
import { csrfFetch } from '@/lib/csrfFetch'

interface SuratMasuk {
  id: string
  noUrut: number
  nomorSurat: string | null
  perihal: string
  tanggalSurat: string
}

const PENGOLAH_OPTIONS = [
  { value: 'KETUA_DPRD', label: 'Ketua DPRD' },
  { value: 'WAKIL_KETUA_1', label: 'Wakil Ketua 1' },
  { value: 'WAKIL_KETUA_2', label: 'Wakil Ketua 2' },
  { value: 'WAKIL_KETUA_3', label: 'Wakil Ketua 3' },
  { value: 'SEKWAN', label: 'Sekwan' }
]

export default function AddSuratKeluarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suratMasukList, setSuratMasukList] = useState<SuratMasuk[]>([])
  
  const [formData, setFormData] = useState({
    noUrut: '',
    klas: '',
    pengolah: '',
    tanggalSurat: '',
    perihalSurat: '',
    kirimKepada: '',
    suratMasukId: '' // optional
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/arsip/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/arsip/dashboard')
    }
  }, [status, session, router])

  // Fetch surat masuk untuk dropdown
  useEffect(() => {
    fetchSuratMasuk()
  }, [])

  const fetchSuratMasuk = async () => {
    try {
      const response = await csrfFetch('/api/surat-masuk?limit=100')
      if (response.ok) {
        const data = await response.json()
        setSuratMasukList(data.suratMasuk || [])
      }
    } catch (error) {
      console.error('Error fetching surat masuk:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSuratMasukChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value
    setFormData(prev => ({ ...prev, suratMasukId: selectedId }))
    
    // Auto-fill perihal and tanggal surat if surat masuk is selected
    if (selectedId) {
      const selectedSurat = suratMasukList.find(s => s.id === selectedId)
      if (selectedSurat) {
        // Format tanggal surat masuk ke format input date (YYYY-MM-DD)
        const tanggalSurat = new Date(selectedSurat.tanggalSurat)
        const formattedTanggal = tanggalSurat.toISOString().split('T')[0]
        
        setFormData(prev => ({
          ...prev,
          perihalSurat: `Re: ${selectedSurat.perihal}`,
          tanggalSurat: formattedTanggal
        }))
      }
    } else {
      // Reset fields when no surat masuk selected
      setFormData(prev => ({
        ...prev,
        perihalSurat: '',
        tanggalSurat: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await csrfFetch('/api/surat-keluar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          noUrut: parseInt(formData.noUrut),
          tanggalSurat: new Date(formData.tanggalSurat).toISOString(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/arsip/surat-keluar')
      } else {
        setError(data.error || 'Terjadi kesalahan saat menyimpan surat')
      }
    } catch (error) {
      console.error('Error saving surat keluar:', error)
      setError('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
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
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 py-3 text-sm text-white/80" style={{ fontFamily: 'Inter, sans-serif' }}>
            <Link href="/arsip/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <span>/</span>
            <Link href="/arsip/surat-keluar" className="hover:text-white transition-colors">Surat Keluar</Link>
            <span>/</span>
            <span className="text-white font-medium">Tambah Baru</span>
          </div>
          
          <div className="flex justify-between items-center pb-6">
            <div className="flex items-center space-x-4">
              {/* Icon Box */}
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Merriweather, serif' }}>Tambah Surat Keluar</h1>
                <p className="mt-2 text-sm text-white/90" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Tambahkan surat keluar baru ke dalam sistem
                </p>
              </div>
            </div>
            <Link
              href="/arsip/surat-keluar"
              className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all shadow-lg hover:shadow-xl"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <X className="h-4 w-4 mr-2" />
              Batal
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="civic-card bg-white shadow-xl rounded-2xl border border-[#E3E3E3]">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-3 border-b border-[#E3E3E3] bg-[#F7F7F7] rounded-t-2xl">
              <h3 className="text-lg font-semibold text-[#1A1A1A]" style={{ fontFamily: 'Merriweather, serif' }}>
                Informasi Surat Keluar
              </h3>
            </div>

            <div className="p-5 space-y-5">
              {error && (
                <div className="bg-red-50 border-l-4 border-[#B82025] text-[#B82025] px-4 py-3 rounded-r-xl text-sm shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {error}
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
                    className="civic-input w-full px-4 py-3 border border-[#E3E3E3] rounded-xl focus:ring-2 focus:ring-[#B82025] focus:border-transparent text-[#1A1A1A] shadow-sm hover:shadow-md transition-shadow"
                    placeholder="Contoh: 1, 2, 3..."
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <p className="mt-2 text-xs text-[#737373] flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Nomor urut surat secara berurutan
                  </p>
                </div>
                
                <div className="group">
                  <label htmlFor="klas" className="flex items-center space-x-2 text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div className="w-6 h-6 bg-[#B82025]/10 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all">
                      <FileText className="h-3.5 w-3.5 text-[#B82025]" />
                    </div>
                    <span>Klas <span className="text-[#B82025]">*</span></span>
                  </label>
                  <input
                    type="text"
                    id="klas"
                    name="klas"
                    value={formData.klas}
                    onChange={handleChange}
                    required
                    className="civic-input w-full px-4 py-3 border border-[#E3E3E3] rounded-xl focus:ring-2 focus:ring-[#B82025] focus:border-transparent text-[#1A1A1A] shadow-sm hover:shadow-md transition-shadow"
                    placeholder="Contoh: SR.01/UM"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <p className="mt-2 text-xs text-[#737373] flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Kode klasifikasi surat
                  </p>
                </div>

                <div className="group">
                  <label htmlFor="pengolah" className="flex items-center space-x-2 text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div className="w-6 h-6 bg-[#C8A348]/10 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all">
                      <Users className="h-3.5 w-3.5 text-[#C8A348]" />
                    </div>
                    <span>Pengolah <span className="text-[#B82025]">*</span></span>
                  </label>
                  <select
                    id="pengolah"
                    name="pengolah"
                    value={formData.pengolah}
                    onChange={handleChange}
                    required
                    className="civic-input w-full px-4 py-3 border border-[#E3E3E3] rounded-xl focus:ring-2 focus:ring-[#B82025] focus:border-transparent text-[#1A1A1A] shadow-sm hover:shadow-md transition-shadow"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="">Pilih Pengolah</option>
                    {PENGOLAH_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-[#737373] flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Pejabat yang mengolah surat
                  </p>
                </div>

                <div className="group">
                  <label htmlFor="tanggalSurat" className="flex items-center space-x-2 text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div className="w-6 h-6 bg-[#B82025]/10 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all">
                      <Calendar className="h-3.5 w-3.5 text-[#B82025]" />
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
                    className="civic-input w-full px-4 py-3 border border-[#E3E3E3] rounded-xl focus:ring-2 focus:ring-[#B82025] focus:border-transparent text-[#1A1A1A] shadow-sm hover:shadow-md transition-shadow"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="suratMasukId" className="block text-sm font-semibold text-[#1A1A1A] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Hubungkan dengan Surat Masuk (Opsional)
                </label>
                <select
                  id="suratMasukId"
                  name="suratMasukId"
                  value={formData.suratMasukId}
                  onChange={handleSuratMasukChange}
                  className="civic-input w-full px-4 py-3 border border-[#E3E3E3] rounded-xl focus:ring-2 focus:ring-[#B82025] focus:border-transparent text-[#1A1A1A] shadow-sm hover:shadow-md transition-shadow"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="">Pilih Surat Masuk (jika ada hubungannya)</option>
                  {suratMasukList.map(surat => (
                    <option key={surat.id} value={surat.id}>
                      {surat.nomorSurat || `No Urut ${surat.noUrut}`} - {surat.perihal}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Jika dipilih, perihal akan terisi otomatis dari surat masuk
                </p>
              </div>

              <div className="group">
                <label htmlFor="perihalSurat" className="flex items-center space-x-2 text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="w-6 h-6 bg-[#C8A348]/10 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all">
                    <MessageSquare className="h-3.5 w-3.5 text-[#C8A348]" />
                  </div>
                  <span>Perihal Surat <span className="text-[#B82025]">*</span></span>
                </label>
                <textarea
                  id="perihalSurat"
                  name="perihalSurat"
                  value={formData.perihalSurat}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="civic-input w-full px-4 py-3 border border-[#E3E3E3] rounded-xl focus:ring-2 focus:ring-[#B82025] focus:border-transparent text-[#1A1A1A] shadow-sm hover:shadow-md transition-shadow resize-none"
                  placeholder="Contoh: Undangan Rapat Koordinasi"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <p className="mt-2 text-xs text-[#737373] flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Isi atau topik utama surat keluar
                </p>
              </div>

              <div className="group">
                <label htmlFor="kirimKepada" className="flex items-center space-x-2 text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="w-6 h-6 bg-[#B82025]/10 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all">
                    <Building className="h-3.5 w-3.5 text-[#B82025]" />
                  </div>
                  <span>Kirim Kepada <span className="text-[#B82025]">*</span></span>
                </label>
                <textarea
                  id="kirimKepada"
                  name="kirimKepada"
                  value={formData.kirimKepada}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="civic-input w-full px-4 py-3 border border-[#E3E3E3] rounded-xl focus:ring-2 focus:ring-[#B82025] focus:border-transparent text-[#1A1A1A] shadow-sm hover:shadow-md transition-shadow resize-none"
                  placeholder="Contoh: Dinas Pendidikan Kota Jakarta"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <p className="mt-2 text-xs text-[#737373] flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Nama instansi atau pejabat yang dituju
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E3E3E3] flex justify-end space-x-3 bg-[#F7F7F7] rounded-b-2xl">
              <Link
                href="/arsip/surat-keluar"
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



