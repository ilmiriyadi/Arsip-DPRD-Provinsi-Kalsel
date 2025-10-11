'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Building, 
  User, 
  FileOutput,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus
} from 'lucide-react'

interface SuratMasuk {
  id: string
  nomorSurat: string
  tanggalSurat: string
  asalSurat: string
  perihal: string
  keterangan?: string
  filePath?: string
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  disposisi: {
    id: string
    nomorDisposisi: string
    tanggalDisposisi: string
    tujuanDisposisi: string
    isiDisposisi: string
    keterangan?: string
    status: 'SELESAI'
    createdAt: string
    createdBy: {
      id: string
      name: string
      email: string
    }
  }[]
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function SuratMasukDetailPage({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [surat, setSurat] = useState<SuratMasuk | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const resolvedParams = use(params)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session && resolvedParams.id) {
      fetchSuratDetail()
    }
  }, [session, resolvedParams.id])

  const fetchSuratDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/surat-masuk/${resolvedParams.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setSurat(data)
      } else if (response.status === 404) {
        setError('Surat masuk tidak ditemukan')
      } else {
        setError('Gagal mengambil detail surat masuk')
      }
    } catch (error) {
      console.error('Error fetching surat detail:', error)
      setError('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = () => {
    return <CheckCircle className="h-5 w-5 text-green-500" />
  }

  const getStatusColor = () => {
    return 'bg-green-100 text-green-800 border-green-200'
  }

  const getStatusText = () => {
    return 'Selesai'
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
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <Link
              href="/dashboard/surat-masuk"
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

  if (!surat) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/surat-masuk"
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detail Surat Masuk</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Informasi lengkap surat dan histori disposisi
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {session.user.role === 'ADMIN' && (
                <>
                  <Link
                    href={`/dashboard/disposisi/add?suratId=${surat.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Disposisi
                  </Link>
                  <Link
                    href={`/dashboard/surat-masuk/edit/${surat.id}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Edit Surat
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Detail Surat */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Informasi Surat
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nomor Surat</label>
                    <p className="mt-1 text-sm text-gray-900 font-semibold">{surat.nomorSurat}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Surat</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(surat.tanggalSurat)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Asal Surat</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <Building className="h-4 w-4 mr-1 text-gray-400" />
                      {surat.asalSurat}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dibuat Oleh</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-400" />
                      {surat.createdBy.name}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Perihal</label>
                  <p className="mt-1 text-sm text-gray-900">{surat.perihal}</p>
                </div>

                {surat.keterangan && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                    <p className="mt-1 text-sm text-gray-900">{surat.keterangan}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700">Tanggal Dibuat</label>
                  <p className="mt-1 text-sm text-gray-500">{formatDateTime(surat.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Histori Disposisi */}
          <div>
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center justify-between">
                  <span className="flex items-center">
                    <FileOutput className="h-5 w-5 mr-2 text-green-600" />
                    Histori Disposisi
                  </span>
                  <span className="text-sm font-normal text-gray-500">
                    ({surat.disposisi.length})
                  </span>
                </h3>
              </div>
              <div className="p-6">
                {surat.disposisi.length === 0 ? (
                  <div className="text-center py-8">
                    <FileOutput className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada disposisi</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Surat ini belum memiliki disposisi
                    </p>
                    {session.user.role === 'ADMIN' && (
                      <div className="mt-6">
                        <Link
                          href={`/dashboard/disposisi/add?suratId=${surat.id}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Buat Disposisi Pertama
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {surat.disposisi
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((disposisi, index) => (
                      <div key={disposisi.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon()}
                              <h4 className="text-sm font-medium text-gray-900">
                                {disposisi.nomorDisposisi}
                              </h4>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor()}`}>
                                {getStatusText()}
                              </span>
                            </div>
                            
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <p><span className="font-medium">Tujuan:</span> {disposisi.tujuanDisposisi}</p>
                              <p><span className="font-medium">Tanggal:</span> {formatDate(disposisi.tanggalDisposisi)}</p>
                              <p><span className="font-medium">Dibuat:</span> {disposisi.createdBy.name}</p>
                            </div>
                            
                            <div className="mt-2">
                              <p className="text-sm text-gray-900">{disposisi.isiDisposisi}</p>
                              {disposisi.keterangan && (
                                <p className="text-xs text-gray-500 mt-1">
                                  <span className="font-medium">Keterangan:</span> {disposisi.keterangan}
                                </p>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-400 mt-2">
                              {formatDateTime(disposisi.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {session.user.role === 'ADMIN' && (
                      <div className="pt-4 border-t border-gray-200">
                        <Link
                          href={`/dashboard/disposisi/add?suratId=${surat.id}`}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Disposisi Baru
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}