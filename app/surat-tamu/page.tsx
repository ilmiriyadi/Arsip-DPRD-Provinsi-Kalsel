"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'

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
}

export default function SuratTamuPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<SuratTamu[]>([])
  const [loading, setLoading] = useState(true)
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
        const url = `/api/surat-tamu?limit=50${debouncedQuery ? `&search=${encodeURIComponent(debouncedQuery)}` : ''}`
        const res = await fetch(url)
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
    // avoid fetching on first render until session available
    if (session) {
      // on mount fetch once, and afterwards when debouncedQuery changes
      if (!mounted.current) {
        mounted.current = true
        fetchData()
      } else {
        fetchData()
      }
    }
  }, [session, debouncedQuery])

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
                <th className="px-4 py-2 text-left text-sm">Aksi</th>
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
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Link href={`/surat-tamu/${it.id}`} className="text-sm text-blue-600">Lihat</Link>
                      <Link href={`/surat-tamu/edit/${it.id}`} className="text-sm text-green-600">Edit</Link>
                      <button onClick={() => handleDelete(it.id)} className="text-sm text-red-600">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
