'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  FileText,
  Users,
  Building,
  Mail,
  Hash,
  User,
  Clock,
  Link as LinkIcon
} from 'lucide-react'

interface SuratKeluar {
  id: string
  noUrut: number
  klas: string
  pengolah: string
  tanggalSurat: string
  perihalSurat: string
  kirimKepada: string
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  suratMasuk?: {
    id: string
    nomorSurat: string
    perihal: string
    asalSurat: string
  }
}

const PENGOLAH_LABELS = {
  KETUA_DPRD: 'Ketua DPRD',
  WAKIL_KETUA_1: 'Wakil Ketua 1',
  WAKIL_KETUA_2: 'Wakil Ketua 2',
  WAKIL_KETUA_3: 'Wakil Ketua 3',
  SEKWAN: 'Sekwan'
}

export default function SuratKeluarDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [suratKeluar, setSuratKeluar] = useState<SuratKeluar | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session && params.id) {
      fetchSuratKeluarDetail()
    }
  }, [session, params.id])

  const fetchSuratKeluarDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/surat-keluar/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setSuratKeluar(data)
      } else if (response.status === 404) {
        setError('Surat keluar tidak ditemukan')
      } else {
        setError('Gagal mengambil detail surat keluar')
      }
    } catch (error) {
      console.error('Error fetching surat keluar detail:', error)
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
              href="/dashboard/surat-keluar"
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

  if (!suratKeluar) return null

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
                <h1 className="text-2xl font-bold text-gray-900">Detail Surat Keluar</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Informasi lengkap surat keluar DPRD Provinsi Kalimantan Selatan
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {session.user.role === 'ADMIN' && (
                <Link
                  href={`/dashboard/surat-keluar/edit/${suratKeluar.id}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Surat
                </Link>
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
                  Informasi Surat Keluar
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nomor Urut</label>
                    <p className="mt-1 text-sm text-gray-900 font-semibold">#{suratKeluar.noUrut}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Surat</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(suratKeluar.tanggalSurat)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Klas</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <Building className="h-4 w-4 mr-1 text-gray-400" />
                      {suratKeluar.klas}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pengolah</label>
                    <span className="mt-1 inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border bg-blue-100 text-blue-800 border-blue-200">
                      <Users className="h-3 w-3 mr-1" />
                      {PENGOLAH_LABELS[suratKeluar.pengolah as keyof typeof PENGOLAH_LABELS]}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Perihal Surat</label>
                  <p className="mt-1 text-sm text-gray-900">{suratKeluar.perihalSurat}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Kirim Kepada</label>
                  <p className="mt-1 text-sm text-gray-900">{suratKeluar.kirimKepada}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700">Tanggal Dibuat</label>
                  <p className="mt-1 text-sm text-gray-500">{formatDateTime(suratKeluar.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hubungan dengan Surat Masuk */}
            {suratKeluar.suratMasuk && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <LinkIcon className="h-5 w-5 mr-2" />
                    Surat Masuk Terkait
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Surat
                    </label>
                    <div className="text-blue-600 font-medium">
                      {suratKeluar.suratMasuk.nomorSurat}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Perihal
                    </label>
                    <div className="text-gray-900">
                      {suratKeluar.suratMasuk.perihal}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asal Surat
                    </label>
                    <div className="text-gray-900">
                      {suratKeluar.suratMasuk.asalSurat}
                    </div>
                  </div>
                  <div className="pt-4">
                    <Link
                      href={`/dashboard/surat-masuk/${suratKeluar.suratMasuk.id}`}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Lihat Surat
                    </Link>
                  </div>
                </div>
              </div>
            )}

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dibuat Oleh
                  </label>
                  <div className="text-gray-900">{suratKeluar.createdBy.name || suratKeluar.createdBy.email}</div>
                  <div className="text-sm text-gray-500">{suratKeluar.createdBy.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dibuat Pada
                  </label>
                  <div className="text-gray-900">{formatDateTime(suratKeluar.createdAt)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terakhir Diupdate
                  </label>
                  <div className="text-gray-900">{formatDateTime(suratKeluar.updatedAt)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}