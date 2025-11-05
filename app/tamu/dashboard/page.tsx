"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'

type SuratTamu = {
  id: string
  noUrut?: number
  nama: string
  keperluan?: string
  asalSurat?: string
  tujuanSurat?: string
  nomorTelpon?: string
  tanggal?: string
}

export default function TamuDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({ total: 0 })
  const [items, setItems] = useState<SuratTamu[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/tamu/login')
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/surat-tamu?limit=5')
        if (res.ok) {
          const data = await res.json()
          setItems(data.suratTamu || [])
          setStats({ total: data.pagination?.total || 0 })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (session) fetchData()
  }, [session])

  if (status === 'loading' || loading) return (
    <DashboardLayout>
      <div className="p-6">Memuat dashboard tamu...</div>
    </DashboardLayout>
  )
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">Selamat datang{session?.user?.name ? `, ${session.user.name}` : ''} 👋</h2>
            <p className="text-sm text-slate-600 mt-1">Ini adalah ringkasan kunjungan tamu Anda. Cepat lihat aktivitas terbaru dan tambah tamu baru.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/surat-tamu/add" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg shadow hover:from-emerald-600">
              Tambah Kunjungan
            </Link>
            <Link href="/surat-tamu" className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700">Lihat Semua</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow p-5 border border-slate-100">
            <p className="text-sm font-medium text-slate-500">Total Surat Tamu</p>
            <p className="text-3xl font-bold mt-2 text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-400 mt-1">Sejak data dimasukkan</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 border border-slate-100">
            <p className="text-sm font-medium text-slate-500">Aktivitas Terbaru</p>
            <p className="text-3xl font-bold mt-2 text-slate-900">{items.length}</p>
            <p className="text-xs text-slate-400 mt-1">Item terbaru ditampilkan di daftar</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 border border-slate-100">
            <p className="text-sm font-medium text-slate-500">Aksi Cepat</p>
            <div className="mt-3 space-x-2">
              <Link href="/surat-tamu/add" className="inline-block px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">Tambah</Link>
              <Link href="/surat-tamu" className="inline-block px-3 py-2 border border-slate-200 rounded-lg text-sm">Daftar</Link>
            </div>
            <p className="text-xs text-slate-400 mt-2">Gunakan aksi cepat untuk manajemen tamu</p>
          </div>
        </div>

        {/* Recent visitors */}
        <div className="bg-white rounded-2xl shadow p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Kunjungan Terbaru</h3>
            <Link href="/surat-tamu" className="text-sm text-blue-600">Lihat Semua</Link>
          </div>

          <div className="space-y-3">
            {items.length > 0 ? items.map((it) => (
              <div key={it.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {it.nama ? it.nama.split(' ').map(s => s[0]).slice(0,2).join('') : '?'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{it.nama}</p>
                    <p className="text-sm text-slate-600">{it.keperluan || '-'} • {it.asalSurat || '-'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">{it.tanggal ? new Date(it.tanggal).toLocaleString('id-ID') : '-'}</div>
                  <div className="mt-2 flex items-center space-x-2">
                    <Link href={`/surat-tamu/${it.id}`} className="text-sm text-blue-600">Lihat</Link>
                    <Link href={`/surat-tamu/edit/${it.id}`} className="text-sm text-slate-600">Edit</Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">Belum ada kunjungan tamu.</p>
                <Link href="/surat-tamu/add" className="inline-block px-4 py-2 bg-emerald-500 text-white rounded-lg">Tambah Kunjungan</Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
