"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'

type SuratTamu = {
  id: string
  noUrut: number
  nama: string
  keperluan: string
  asalSurat: string
  tujuanSurat: string
  nomorTelpon?: string
  tanggal: string
}

export default function SuratTamuDetail() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [item, setItem] = useState<SuratTamu | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/surat-tamu/${id}`)
        if (res.ok) {
          const data = await res.json()
          setItem(data)
        } else {
          router.push('/surat-tamu')
        }
      } catch (err) {
        console.error(err)
        router.push('/surat-tamu')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchItem()
  }, [id, router])

  const handleDelete = async () => {
    if (!confirm('Hapus surat tamu ini?')) return
    try {
      const res = await fetch(`/api/surat-tamu/${id}`, { method: 'DELETE' })
      if (res.ok) router.push('/surat-tamu')
      else {
        const data = await res.json()
        alert(data.error || 'Gagal menghapus')
      }
    } catch (err) {
      console.error(err)
      alert('Terjadi kesalahan')
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div className="p-6">Memuat...</div>
    </DashboardLayout>
  )

  if (!item) return (
    <DashboardLayout>
      <div className="p-6">Data tidak ditemukan</div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">{item.nama}</h2>
              <p className="text-sm text-slate-500">No Urut: {item.noUrut}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => router.push(`/surat-tamu/edit/${id}`)} className="text-sm text-green-600">Edit</button>
              <button onClick={handleDelete} className="text-sm text-red-600">Hapus</button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div><strong>Keperluan:</strong> {item.keperluan}</div>
            <div><strong>Asal:</strong> {item.asalSurat}</div>
            <div><strong>Tujuan:</strong> {item.tujuanSurat}</div>
            <div><strong>Nomor Telepon:</strong> {item.nomorTelpon || '-'}</div>
            <div><strong>Tanggal:</strong> {new Date(item.tanggal).toLocaleString('id-ID')}</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
