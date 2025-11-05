"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'

interface SuratTamu {
  id: string
  noUrut: number
  nama: string
  keperluan: string
  asalSurat: string
  tujuanSurat: string
  nomorTelpon?: string
  tanggal: string
}

export default function SuratTamuPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<SuratTamu[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/surat-tamu?limit=20')
        if (res.ok) {
          const data = await res.json()
          setItems(data.suratTamu || [])
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
      <div className="p-6">Memuat...</div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Arsip Surat Tamu</h2>
          <Link href="/surat-tamu/add" className="bg-green-600 text-white px-4 py-2 rounded-md">Tambah Surat Tamu</Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y table-auto">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm">No</th>
                <th className="px-4 py-2 text-left text-sm">Nama</th>
                <th className="px-4 py-2 text-left text-sm">Keperluan</th>
                <th className="px-4 py-2 text-left text-sm">Asal</th>
                <th className="px-4 py-2 text-left text-sm">Tujuan</th>
                <th className="px-4 py-2 text-left text-sm">Telp</th>
                <th className="px-4 py-2 text-left text-sm">Tanggal</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2">{it.noUrut}</td>
                  <td className="px-4 py-2">{it.nama}</td>
                  <td className="px-4 py-2">{it.keperluan}</td>
                  <td className="px-4 py-2">{it.asalSurat}</td>
                  <td className="px-4 py-2">{it.tujuanSurat}</td>
                  <td className="px-4 py-2">{it.nomorTelpon || '-'}</td>
                  <td className="px-4 py-2">{new Date(it.tanggal).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
