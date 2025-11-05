"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
import { FileText, Plus, Search, Eye, Edit, Trash2, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

// debounce helper
function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

interface SuratTamu {
  id: string
  noUrut: number
  nama: string
  keperluan: string
  asalSurat: string
  tujuanSurat: string
  nomorTelpon?: string
  tanggal: string
  createdBy?: { id: string; name: string; email: string }
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function SuratTamuPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<SuratTamu[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 50, totalPages: 0 })
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)
  const mounted = useRef(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const url = new URL('/api/surat-tamu', location.href)
        url.searchParams.set('limit', String(pagination.limit))
        url.searchParams.set('page', String(pagination.page))
        if (debouncedQuery) url.searchParams.set('search', debouncedQuery)
        const res = await fetch(url.toString())
        if (res.ok) {
          const data = await res.json()
          setItems(data.suratTamu || [])
          if (data.pagination) setPagination(data.pagination)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    // avoid fetching on first render until session available
    if (session) {
      if (!mounted.current) {
        mounted.current = true
        fetchData()
      } else {
        fetchData()
      }
    }
  }, [session, debouncedQuery, pagination.page])

  const handleClearSearch = () => {
    setQuery('')
    setPagination((p) => ({ ...p, page: 1 }))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus surat tamu ini?')) return
    try {
      const res = await fetch(`/api/surat-tamu/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems((s) => s.filter((it) => it.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal menghapus')
      }
    } catch (err) {
      console.error(err)
      alert('Terjadi kesalahan')
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })

  if (status === 'loading' || loading) return (
    <DashboardLayout>
      <div className="p-6">Memuat...</div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Surat Tamu
                </h1>
                <p className="mt-1 text-sm text-slate-600 font-medium">
                  Arsip dan manajemen kunjungan tamu
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {session?.user?.role === 'ADMIN' && (
                <Link
                  href="/surat-tamu/add"
                  className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Surat
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter (simplified) */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                <Filter className="h-4 w-4 text-white" />
              </div>
              Pencarian
            </h3>
            <p className="text-sm text-slate-600 mt-1 ml-11">Cari berdasarkan nama, asal, atau tujuan</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3">🔍 Pencarian Real-time</label>
                <div className="relative group">
                  <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400`} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                    className="w-full pl-12 pr-12 py-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-700 placeholder-slate-400 shadow-sm hover:shadow-md"
                    placeholder="Ketik untuk mencari nama, asal, atau tujuan..."
                  />
                  {query && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 hover:text-red-500 transition-colors duration-200 bg-slate-100 hover:bg-red-50 rounded-full p-1"
                      title="Hapus pencarian"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Daftar Surat Tamu</h3>
                  {pagination.total > 0 && (
                    <p className="text-sm text-slate-600">Total {pagination.total} entri • Halaman {pagination.page} dari {pagination.totalPages}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div><p className="mt-4 text-slate-600 font-medium">Memuat data...</p></div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Belum Ada Surat Tamu</h3>
              <p className="text-slate-600 mb-6 max-w-sm mx-auto">Belum ada data kunjungan tamu. Tambahkan data terlebih dahulu.</p>
              {session?.user?.role === 'ADMIN' && (
                <Link href="/surat-tamu/add" className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-xl">
                  <Plus className="h-4 w-4 mr-2" /> Tambah Surat Tamu
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">#</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">Nama</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">Keperluan</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">Asal</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">Tujuan</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">Telp</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">Tanggal</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {items.map((it) => (
                      <tr key={it.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">{it.noUrut}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap"><div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{it.nama}</div></td>
                        <td className="px-6 py-5"><div className="text-sm text-slate-700 max-w-xs truncate" title={it.keperluan}>{it.keperluan}</div></td>
                        <td className="px-6 py-5 whitespace-nowrap"><div className="text-sm text-slate-900 font-medium">{it.asalSurat}</div></td>
                        <td className="px-6 py-5"><div className="text-sm text-slate-700">{it.tujuanSurat}</div></td>
                        <td className="px-6 py-5 whitespace-nowrap"><div className="text-sm text-slate-700">{it.nomorTelpon || '-'}</div></td>
                        <td className="px-6 py-5 whitespace-nowrap"><div className="text-sm text-slate-600 font-medium">{formatDate(it.tanggal)}</div></td>
                        <td className="px-6 py-5 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-1">
                            <Link href={`/surat-tamu/${it.id}`} className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md" title="Lihat Detail"><Eye className="h-4 w-4" /></Link>
                            {session?.user?.role === 'ADMIN' && (
                              <>
                                <Link href={`/surat-tamu/edit/${it.id}`} className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md" title="Edit"><Edit className="h-4 w-4" /></Link>
                                <button onClick={() => handleDelete(it.id)} className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-5 flex items-center justify-between border-t border-slate-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <p className="text-sm font-medium text-slate-700">Menampilkan <span className="font-bold text-blue-700">{(pagination.page - 1) * pagination.limit + 1}</span> - <span className="font-bold text-blue-700">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari <span className="font-bold text-blue-700">{pagination.total}</span> entri</p>
                  </div>
                  <div>
                    <nav className="flex items-center space-x-2">
                      <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page === 1} className="inline-flex items-center justify-center w-10 h-10 bg-white border border-slate-300 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 disabled:opacity-50 rounded-xl shadow-sm transition-all duration-200"><ChevronLeft className="h-5 w-5" /></button>
                      <div className="flex items-center space-x-1"><span className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-lg">{pagination.page}</span><span className="text-slate-500 font-medium">dari</span><span className="px-3 py-2 bg-white border border-slate-300 text-slate-600 text-sm font-medium rounded-lg">{pagination.totalPages}</span></div>
                      <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))} disabled={pagination.page === pagination.totalPages} className="inline-flex items-center justify-center w-10 h-10 bg-white border border-slate-300 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 disabled:opacity-50 rounded-xl shadow-sm transition-all duration-200"><ChevronRight className="h-5 w-5" /></button>
                    </nav>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
