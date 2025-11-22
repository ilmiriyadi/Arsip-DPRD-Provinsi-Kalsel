'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Save, X } from 'lucide-react'
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
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
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
        router.push('/dashboard/surat-masuk')
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tambah Surat Masuk</h1>
              <p className="mt-1 text-sm text-gray-600">
                Tambahkan surat masuk baru ke dalam sistem
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Informasi Surat Masuk
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
                  <label htmlFor="nomorSurat" className="block text-sm font-medium text-gray-900 mb-2">
                    Nomor Surat <span className="text-gray-500">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    id="nomorSurat"
                    name="nomorSurat"
                    value={formData.nomorSurat}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Contoh: 001/SKM/X/2024"
                  />
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

                <div>
                  <label htmlFor="tanggalDiteruskan" className="block text-sm font-medium text-gray-900 mb-2">
                    Tanggal Diteruskan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="tanggalDiteruskan"
                    name="tanggalDiteruskan"
                    value={formData.tanggalDiteruskan}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="asalSurat" className="block text-sm font-medium text-gray-900 mb-2">
                  Asal Surat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="asalSurat"
                  name="asalSurat"
                  value={formData.asalSurat}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Contoh: Dinas Pendidikan Kota Jakarta"
                />
              </div>

              <div>
                <label htmlFor="perihal" className="block text-sm font-medium text-gray-900 mb-2">
                  Perihal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="perihal"
                  name="perihal"
                  value={formData.perihal}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Contoh: Undangan Rapat Koordinasi"
                />
              </div>

              <div>
                <label htmlFor="keterangan" className="block text-sm font-medium text-gray-900 mb-2">
                  Keterangan
                </label>
                <textarea
                  id="keterangan"
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Catatan atau keterangan tambahan (opsional)"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <Link
                href="/dashboard/surat-masuk"
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
                {loading ? 'Menyimpan...' : 'Simpan Surat'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

