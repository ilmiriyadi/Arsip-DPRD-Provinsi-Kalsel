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
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold">Statistik Surat Tamu</h3>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Aktivitas Terbaru - Surat Tamu</h4>
            <Link href="/surat-tamu" className="text-sm text-blue-600">Lihat Semua</Link>
          </div>
          <div className="space-y-3">
            {items.length > 0 ? items.map((it) => (
              <div key={it.id} className="p-3 bg-slate-50 rounded">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{it.nama} — {it.keperluan}</p>
                    <p className="text-sm text-slate-600">{it.asalSurat} → {it.tujuanSurat}</p>
                  </div>
                  <div className="text-sm text-slate-500">{it.tanggal ? new Date(it.tanggal).toLocaleString('id-ID') : '-'}</div>
                </div>
              </div>
            )) : (
              <p className="text-slate-600">Belum ada surat tamu</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
