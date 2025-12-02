'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  ClipboardList, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Building,
  FileText,
  MessageSquare,
  CheckCircle,
  Hash
} from 'lucide-react'

interface Disposisi {
  id: string
  noUrut: number
  tanggalDisposisi: string
  tujuanDisposisi: string
  isiDisposisi: string
  keterangan?: string
  status: 'SELESAI'
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  suratMasuk: {
    id: string
    noUrut: number
    nomorSurat: string | null
    perihal: string
    asalSurat: string
    tanggalSurat: string
  }
}

export default function DetailDisposisiPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [disposisi, setDisposisi] = useState<Disposisi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/arsip/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session && id) {
      fetchDisposisi()
    }
  }, [session, id])

  const fetchDisposisi = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/disposisi/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        setDisposisi(data)
      } else if (response.status === 404) {
        setError('Disposisi tidak ditemukan')
      } else {
        setError('Gagal mengambil data disposisi')
      }
    } catch (error) {
      console.error('Error fetching disposisi:', error)
      setError('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus disposisi ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/disposisi/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/dashboard/disposisi')
      } else {
        alert('Gagal menghapus disposisi')
      }
    } catch (error) {
      console.error('Error deleting disposisi:', error)
      alert('Terjadi kesalahan sistem')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    return (
      <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
        <CheckCircle className="h-4 w-4 mr-1" />
        Selesai
      </span>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{error}</h3>
          <div className="mt-6">
            <Link
              href="/dashboard/disposisi"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!disposisi) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/disposisi"
                className="inline-flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Kembali
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Detail Disposisi #{disposisi.noUrut}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Informasi lengkap disposisi dan surat terkait
                </p>
              </div>
            </div>
            {session.user.role === 'ADMIN' && (
              <div className="flex space-x-3">
                <Link
                  href={`/dashboard/disposisi/edit/${disposisi.id}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-slate-800 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informasi Disposisi */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2" />
                  Informasi Disposisi
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-2">
                      <Hash className="inline h-4 w-4 mr-1" />
                      No Urut
                    </label>
                    <div className="text-lg font-semibold text-blue-600">
                      #{disposisi.noUrut}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Tanggal Disposisi
                    </label>
                    <div className="text-gray-900">
                      {formatDateOnly(disposisi.tanggalDisposisi)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">
                    <Building className="inline h-4 w-4 mr-1" />
                    Tujuan Disposisi
                  </label>
                  <div className="text-gray-900 font-medium">
                    {disposisi.tujuanDisposisi}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">
                    <FileText className="inline h-4 w-4 mr-1" />
                    Isi Disposisi
                  </label>
                  <div className="bg-gray-50 rounded-md p-4 text-gray-900">
                    {disposisi.isiDisposisi}
                  </div>
                </div>

                {disposisi.keterangan && (
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-2">
                      <MessageSquare className="inline h-4 w-4 mr-1" />
                      Keterangan
                    </label>
                    <div className="bg-gray-50 rounded-md p-4 text-gray-900">
                      {disposisi.keterangan}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">
                    Status
                  </label>
                  {getStatusBadge(disposisi.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informasi Surat Masuk Terkait */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Surat Masuk Terkait
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    No Urut Surat
                  </label>
                  <div className="text-blue-600 font-medium">
                    #{disposisi.suratMasuk.noUrut}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    Nomor Surat
                  </label>
                  <div className="text-gray-900 font-medium">
                    {disposisi.suratMasuk.nomorSurat}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    Perihal
                  </label>
                  <div className="text-gray-900">
                    {disposisi.suratMasuk.perihal}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    Asal Surat
                  </label>
                  <div className="text-gray-900">
                    {disposisi.suratMasuk.asalSurat}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    Tanggal Surat
                  </label>
                  <div className="text-gray-900">
                    {formatDateOnly(disposisi.suratMasuk.tanggalSurat)}
                  </div>
                </div>
                <div className="pt-4">
                  <Link
                    href={`/dashboard/surat-masuk/${disposisi.suratMasuk.id}`}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Lihat Surat
                  </Link>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Metadata
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    Dibuat Oleh
                  </label>
                  <div className="text-gray-900">{disposisi.createdBy.name}</div>
                  <div className="text-sm text-gray-500">{disposisi.createdBy.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    Dibuat Pada
                  </label>
                  <div className="text-gray-900">{formatDate(disposisi.createdAt)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    Terakhir Diupdate
                  </label>
                  <div className="text-gray-900">{formatDate(disposisi.updatedAt)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}