'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Save, X, ArrowLeft } from 'lucide-react'
import { csrfFetch } from '@/lib/csrfFetch'

interface SuratKeluar {
  id: string
  noUrut: number
  klas: string
  pengolah: string
  tanggalSurat: string
  perihalSurat: string
  kirimKepada: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  suratMasuk?: {
    id: string
    nomorSurat: string | null
    perihal: string
  }
}

interface SuratMasuk {
  id: string
  noUrut: number
  nomorSurat: string | null
  perihal: string
  tanggalSurat: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

const PENGOLAH_OPTIONS = [
  { value: 'KETUA_DPRD', label: 'Ketua DPRD' },
  { value: 'WAKIL_KETUA_1', label: 'Wakil Ketua 1' },
  { value: 'WAKIL_KETUA_2', label: 'Wakil Ketua 2' },
  { value: 'WAKIL_KETUA_3', label: 'Wakil Ketua 3' },
  { value: 'SEKWAN', label: 'Sekwan' }
]

export default function EditSuratKeluarPage({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [surat, setSurat] = useState<SuratKeluar | null>(null)
  const [suratMasukList, setSuratMasukList] = useState<SuratMasuk[]>([])
  const resolvedParams = use(params)
  
  const [formData, setFormData] = useState({
    noUrut: '',
    klas: '',
    pengolah: '',
    tanggalSurat: '',
    perihalSurat: '',
    kirimKepada: '',
    suratMasukId: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session && resolvedParams.id) {
      fetchSuratData()
      fetchSuratMasuk()
    }
  }, [session, resolvedParams.id])

  const fetchSuratData = async () => {
    try {
      setFetchLoading(true)
      const response = await csrfFetch(`/api/surat-keluar/${resolvedParams.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setSurat(data)
        
        // Pre-fill form with existing data
        setFormData({
          noUrut: data.noUrut.toString(),
          klas: data.klas,
          pengolah: data.pengolah,
          tanggalSurat: new Date(data.tanggalSurat).toISOString().split('T')[0],
          perihalSurat: data.perihalSurat,
          kirimKepada: data.kirimKepada,
          suratMasukId: data.suratMasuk?.id || ''
        })
      } else if (response.status === 404) {
        setError('Surat keluar tidak ditemukan')
      } else {
        setError('Gagal mengambil data surat keluar')
      }
    } catch (error) {
      console.error('Error fetching surat data:', error)
      setError('Terjadi kesalahan sistem')
    } finally {
      setFetchLoading(false)
    }
  }

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await csrfFetch(`/api/surat-keluar/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          noUrut: parseInt(formData.noUrut),
          tanggalSurat: new Date(formData.tanggalSurat).toISOString(),
        }),
      })

      if (response.ok) {
        router.push('/dashboard/surat-keluar')
      } else {
        const data = await response.json()
        setError(data.error || 'Terjadi kesalahan saat mengupdate surat keluar')
      }
    } catch (error) {
      console.error('Error updating surat keluar:', error)
      setError('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  if (error && !surat) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium">{error}</div>
          <div className="mt-4">
            <Link
              href="/dashboard/surat-keluar"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/surat-keluar"
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Surat Keluar</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Edit informasi surat keluar yang sudah ada
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Informasi Surat Keluar
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="noUrut" className="block text-sm font-medium text-gray-900 mb-2">
                    No Urut <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="noUrut"
                    name="noUrut"
                    value={formData.noUrut}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Contoh: 1, 2, 3..."
                  />
                </div>
                
                <div>
                  <label htmlFor="klas" className="block text-sm font-medium text-gray-900 mb-2">
                    Klas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="klas"
                    name="klas"
                    value={formData.klas}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Contoh: SR.01/UM"
                  />
                </div>

                <div>
                  <label htmlFor="pengolah" className="block text-sm font-medium text-gray-900 mb-2">
                    Pengolah <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="pengolah"
                    name="pengolah"
                    value={formData.pengolah}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Pilih Pengolah</option>
                    {PENGOLAH_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tanggalSurat" className="block text-sm font-medium text-gray-900 mb-2">
                    Tanggal Surat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="tanggalSurat"
                    name="tanggalSurat"
                    value={formData.tanggalSurat}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="suratMasukId" className="block text-sm font-medium text-gray-900 mb-2">
                  Hubungkan dengan Surat Masuk (Opsional)
                </label>
                <select
                  id="suratMasukId"
                  name="suratMasukId"
                  value={formData.suratMasukId}
                  onChange={handleSuratMasukChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Pilih Surat Masuk (jika ada hubungannya)</option>
                  {suratMasukList.map(surat => (
                    <option key={surat.id} value={surat.id}>
                      {surat.nomorSurat || `No Urut ${surat.noUrut}`} - {surat.perihal}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Jika dipilih, perihal akan terisi otomatis dari surat masuk
                </p>
              </div>

              <div>
                <label htmlFor="perihalSurat" className="block text-sm font-medium text-gray-900 mb-2">
                  Perihal Surat <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="perihalSurat"
                  name="perihalSurat"
                  value={formData.perihalSurat}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Contoh: Undangan Rapat Koordinasi"
                />
              </div>

              <div>
                <label htmlFor="kirimKepada" className="block text-sm font-medium text-gray-900 mb-2">
                  Kirim Kepada <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="kirimKepada"
                  name="kirimKepada"
                  value={formData.kirimKepada}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Contoh: Dinas Pendidikan Kota Jakarta"
                />
              </div>

              {surat && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Informasi Tambahan</h4>
                  <p className="text-sm text-gray-600">
                    Dibuat oleh: <span className="font-medium">{surat.createdBy.name}</span>
                  </p>
                  {surat.suratMasuk && (
                    <p className="text-sm text-gray-600 mt-1">
                      Terkait surat masuk: <span className="font-medium">{surat.suratMasuk.nomorSurat || '-'}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <Link
                href="/dashboard/surat-keluar"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-900 bg-white hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}