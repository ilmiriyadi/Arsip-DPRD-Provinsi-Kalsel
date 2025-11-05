"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function EditSuratTamu() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [form, setForm] = useState({ noUrut: '', nama: '', keperluan: '', asalSurat: '', tujuanSurat: '', nomorTelpon: '', tanggal: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/surat-tamu/${id}`)
        if (res.ok) {
          const data = await res.json()
          setForm({
            noUrut: String(data.noUrut || ''),
            nama: data.nama || '',
            keperluan: data.keperluan || '',
            asalSurat: data.asalSurat || '',
            tujuanSurat: data.tujuanSurat || '',
            nomorTelpon: data.nomorTelpon || '',
            tanggal: data.tanggal ? new Date(data.tanggal).toISOString().slice(0,16) : ''
          })
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

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      setSaving(true)
      const payload = {
        noUrut: Number(form.noUrut),
        nama: form.nama,
        keperluan: form.keperluan,
        asalSurat: form.asalSurat,
        tujuanSurat: form.tujuanSurat,
        nomorTelpon: form.nomorTelpon || undefined,
        tanggal: new Date(form.tanggal).toISOString(),
      }
      const res = await fetch(`/api/surat-tamu/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) {
        router.push(`/surat-tamu/${id}`)
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal menyimpan')
      }
    } catch (err) {
      console.error(err)
      alert('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div className="p-6">Memuat...</div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Edit Surat Tamu</h2>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-slate-700">No Urut</label>
            <input name="noUrut" value={form.noUrut} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Nama</label>
            <input name="nama" value={form.nama} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Keperluan</label>
            <input name="keperluan" value={form.keperluan} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Asal Surat</label>
            <input name="asalSurat" value={form.asalSurat} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Tujuan</label>
            <input name="tujuanSurat" value={form.tujuanSurat} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Nomor Telepon</label>
            <input name="nomorTelpon" value={form.nomorTelpon} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Hari & Tanggal</label>
            <input name="tanggal" type="datetime-local" value={form.tanggal} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
