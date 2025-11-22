"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function AddSuratTamu() {
  const { status } = useSession()
  const router = useRouter()
  const [form, setForm] = useState({ noUrut: '', nama: '', keperluan: '', asalSurat: '', tujuanSurat: '', nomorTelpon: '', tanggal: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      setLoading(true)
      const payload = {
        noUrut: Number(form.noUrut),
        nama: form.nama,
        keperluan: form.keperluan,
        asalSurat: form.asalSurat,
        tujuanSurat: form.tujuanSurat,
        nomorTelpon: form.nomorTelpon || undefined,
        tanggal: new Date(form.tanggal).toISOString(),
      }
      const res = await csrfFetch('/api/surat-tamu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) {
        router.push('/surat-tamu')
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal menyimpan')
      }
    } catch (err) {
      console.error(err)
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Tambah Surat Tamu</h2>
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
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
