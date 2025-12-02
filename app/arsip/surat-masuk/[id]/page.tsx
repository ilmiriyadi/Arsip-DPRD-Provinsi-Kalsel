'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { csrfFetch } from '@/lib/csrfFetch'
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Building, 
  User, 
  FileOutput,
  CheckCircle,
  Plus
} from 'lucide-react'

interface SuratMasuk {
  id: string
  nomorSurat: string
  tanggalSurat: string
  tanggalDiteruskan: string
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
      router.push('/arsip/login')
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
      const response = await csrfFetch(`/api/surat-masuk/${resolvedParams.id}`)
      
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

  const getStatusText = () => {
    return 'Selesai'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F7F7F7] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#E3E3E3] mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#B82025] border-t-transparent absolute top-0 left-1/2 -ml-8"></div>
          </div>
          <p className="mt-6 text-[#1A1A1A] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>Memuat detail surat...</p>
          <p className="mt-2 text-sm text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>Mohon tunggu sebentar</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F7F7F7] to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FileText className="h-10 w-10 text-[#B82025]" />
          </div>
          <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Merriweather, serif' }}>Oops!</h3>
          <p className="text-[#737373] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>{error}</p>
          <Link
            href="/arsip/surat-masuk"
            className="civic-btn-primary inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-[#B82025] hover:bg-[#8B1A1F] hover:shadow-xl transition-all"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar
          </Link>
        </div>
      </div>
    )
  }

  if (!surat) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F7F7] to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#B82025] to-[#8B1A1F] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-white/80 text-sm mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              <Link href="/arsip/surat-masuk" className="hover:text-white transition-colors">Surat Masuk</Link>
              <span>/</span>
              <span className="text-white font-medium">Detail</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <Link
                  href="/arsip/surat-masuk"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
                >
                  <ArrowLeft className="h-5 w-5 text-white" />
                </Link>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center" style={{ fontFamily: 'Merriweather, serif' }}>
                    <FileText className="h-7 w-7 mr-3" />
                    Detail Surat Masuk
                  </h1>
                  <p className="mt-1 text-sm text-white/90" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Informasi lengkap dan histori disposisi
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {session.user.role === 'ADMIN' && (
                  <>
                    <Link
                      href={`/arsip/disposisi/add?suratId=${surat.id}`}
                      className="civic-btn-primary inline-flex items-center px-4 py-2.5 border-2 border-[#C8A348] rounded-xl shadow-lg text-sm font-semibold text-white bg-[#C8A348] hover:bg-[#B89438] hover:shadow-xl transition-all"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Buat Disposisi
                    </Link>
                    <Link
                      href={`/arsip/surat-masuk/edit/${surat.id}`}
                      className="inline-flex items-center px-4 py-2.5 border-2 border-white/30 rounded-xl shadow-md text-sm font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Edit Surat
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Detail Surat */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Card dengan Nomor Surat */}
            <div className="civic-card bg-gradient-to-br from-[#B82025] to-[#8B1A1F] rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-white/80" style={{ fontFamily: 'Inter, sans-serif' }}>Nomor Surat</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Merriweather, serif' }}>
                    {surat.nomorSurat || 'Tidak Ada Nomor'}
                  </h2>
                  <p className="text-white/70 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>No Urut: {surat.id.substring(0, 8)}</p>
                </div>
                <div className="hidden sm:block w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm"></div>
              </div>
            </div>

            {/* Main Info Card */}
            <div className="civic-card bg-white shadow-2xl rounded-2xl border border-[#E3E3E3] overflow-hidden">
              <div className="bg-gradient-to-r from-[#F7F7F7] to-white px-6 py-5 border-b border-[#E3E3E3]">
                <h3 className="text-lg font-bold text-[#1A1A1A] flex items-center" style={{ fontFamily: 'Merriweather, serif' }}>
                  <div className="w-8 h-8 bg-[#B82025] rounded-lg flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  Informasi Lengkap Surat
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Building className="h-4 w-4 text-blue-600" />
                      </div>
                      <label className="text-xs font-semibold text-[#737373] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Asal Surat</label>
                    </div>
                    <p className="text-sm text-[#1A1A1A] font-semibold pl-10" style={{ fontFamily: 'Inter, sans-serif' }}>{surat.asalSurat}</p>
                  </div>
                  
                  <div className="group">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Calendar className="h-4 w-4 text-[#C8A348]" />
                      </div>
                      <label className="text-xs font-semibold text-[#737373] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Tanggal Surat</label>
                    </div>
                    <p className="text-sm text-[#1A1A1A] font-semibold pl-10" style={{ fontFamily: 'Inter, sans-serif' }}>{formatDate(surat.tanggalSurat)}</p>
                  </div>
                  
                  <div className="group">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-[#C8A348]/10 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all">
                        <FileOutput className="h-4 w-4 text-[#C8A348]" />
                      </div>
                      <label className="text-xs font-semibold text-[#737373] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Tanggal Diteruskan</label>
                    </div>
                    <p className="text-sm text-[#1A1A1A] font-semibold pl-10" style={{ fontFamily: 'Inter, sans-serif' }}>{formatDate(surat.tanggalDiteruskan)}</p>
                  </div>

                  <div className="group">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <User className="h-4 w-4 text-orange-600" />
                      </div>
                      <label className="text-xs font-semibold text-[#737373] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Dibuat Oleh</label>
                    </div>
                    <p className="text-sm text-[#1A1A1A] font-semibold pl-10" style={{ fontFamily: 'Inter, sans-serif' }}>{surat.createdBy.name}</p>
                  </div>
                </div>
                
                {/* Perihal */}
                <div className="bg-gradient-to-r from-[#F7F7F7] to-white p-5 rounded-xl border-l-4 border-[#B82025]">
                  <label className="block text-xs font-bold text-[#B82025] uppercase tracking-wide mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Perihal</label>
                  <p className="text-sm text-[#1A1A1A] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{surat.perihal}</p>
                </div>

                {surat.keterangan && (
                  <div className="bg-gradient-to-r from-blue-50 to-white p-5 rounded-xl border-l-4 border-blue-400">
                    <label className="block text-xs font-bold text-blue-600 uppercase tracking-wide mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Keterangan</label>
                    <p className="text-sm text-[#1A1A1A] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{surat.keterangan}</p>
                  </div>
                )}

                {/* Footer Info */}
                <div className="pt-4 border-t border-[#E3E3E3]">
                  <div className="flex items-center justify-between text-xs text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-[#C8A348] rounded-full mr-2"></div>
                      Dibuat: {formatDateTime(surat.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Histori Disposisi */}
          <div className="space-y-6">
            <div className="civic-card bg-white shadow-2xl rounded-2xl border border-[#E3E3E3] overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-[#C8A348] to-[#B89438] px-6 py-5">
                <h3 className="text-lg font-bold text-white flex items-center justify-between" style={{ fontFamily: 'Merriweather, serif' }}>
                  <span className="flex items-center">
                    <FileOutput className="h-5 w-5 mr-2" />
                    Histori Disposisi
                  </span>
                  <span className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full font-semibold">
                    {surat.disposisi.length}
                  </span>
                </h3>
              </div>
              <div className="p-6">
                {surat.disposisi.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#F7F7F7] to-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <FileOutput className="h-10 w-10 text-[#737373]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: 'Merriweather, serif' }}>Belum Ada Disposisi</h3>
                    <p className="text-sm text-[#737373] mb-6 max-w-xs mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Surat ini belum memiliki disposisi. Buat disposisi pertama sekarang.
                    </p>
                    {session.user.role === 'ADMIN' && (
                      <Link
                        href={`/arsip/disposisi/add?suratId=${surat.id}`}
                        className="civic-btn-primary inline-flex items-center px-5 py-3 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-[#B82025] hover:bg-[#8B1A1F] hover:shadow-xl transition-all"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Buat Disposisi Pertama
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Timeline */}
                    <div className="relative space-y-4">
                      {surat.disposisi
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((disposisi, index) => (
                        <div key={disposisi.id} className="relative">
                          {/* Timeline Line */}
                          {index !== surat.disposisi.length - 1 && (
                            <div className="absolute left-4 top-12 w-0.5 h-full bg-gradient-to-b from-[#C8A348] to-[#E3E3E3]"></div>
                          )}
                          
                          {/* Timeline Item */}
                          <div className="relative bg-gradient-to-br from-white to-[#FAFAFA] border-2 border-[#E3E3E3] rounded-xl p-4 hover:shadow-lg transition-all group">
                            {/* Timeline Dot */}
                            <div className="absolute -left-1 top-4 w-8 h-8 bg-[#C8A348] rounded-full border-4 border-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                            
                            <div className="pl-10">
                              {/* Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="text-sm font-bold text-[#1A1A1A] mb-1" style={{ fontFamily: 'Merriweather, serif' }}>
                                    {disposisi.nomorDisposisi}
                                  </h4>
                                  <div className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-[#C8A348]/20 text-[#C8A348] border border-[#C8A348]/30 shadow-sm">
                                    {getStatusText()}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Details */}
                              <div className="space-y-2 mb-3">
                                <div className="flex items-start">
                                  <div className="w-20 text-xs font-semibold text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>Tujuan:</div>
                                  <div className="flex-1 text-xs text-[#1A1A1A] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{disposisi.tujuanDisposisi}</div>
                                </div>
                                <div className="flex items-start">
                                  <div className="w-20 text-xs font-semibold text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>Tanggal:</div>
                                  <div className="flex-1 text-xs text-[#1A1A1A] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{formatDate(disposisi.tanggalDisposisi)}</div>
                                </div>
                                <div className="flex items-start">
                                  <div className="w-20 text-xs font-semibold text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>Oleh:</div>
                                  <div className="flex-1 text-xs text-[#1A1A1A] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{disposisi.createdBy.name}</div>
                                </div>
                              </div>
                              
                              {/* Content */}
                              <div className="bg-white p-3 rounded-lg border border-[#E3E3E3] mb-2">
                                <p className="text-xs text-[#1A1A1A] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{disposisi.isiDisposisi}</p>
                                {disposisi.keterangan && (
                                  <p className="text-xs text-[#737373] mt-2 pt-2 border-t border-[#E3E3E3]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    <span className="font-semibold">Catatan:</span> {disposisi.keterangan}
                                  </p>
                                )}
                              </div>
                              
                              {/* Footer */}
                              <div className="flex items-center text-xs text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                <div className="w-1.5 h-1.5 bg-[#C8A348] rounded-full mr-2"></div>
                                {formatDateTime(disposisi.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {session.user.role === 'ADMIN' && (
                      <div className="pt-4 border-t-2 border-dashed border-[#E3E3E3]">
                        <Link
                          href={`/arsip/disposisi/add?suratId=${surat.id}`}
                          className="civic-btn-secondary w-full inline-flex justify-center items-center px-4 py-3 border-2 border-[#E3E3E3] shadow-md text-sm font-semibold rounded-xl text-[#1A1A1A] bg-white hover:bg-[#F7F7F7] hover:border-[#B82025] hover:text-[#B82025] hover:shadow-lg transition-all"
                          style={{ fontFamily: 'Inter, sans-serif' }}
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