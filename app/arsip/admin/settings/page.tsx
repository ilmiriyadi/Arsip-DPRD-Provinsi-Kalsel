'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { csrfFetch } from '@/lib/csrfFetch'
import { 
  Database,
  User,
  Mail,
  Lock,
  Save,
  RefreshCw,
  Info,
  AlertTriangle
} from 'lucide-react'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSurat: 0,
    totalDisposisi: 0,
    databaseSize: 'Unknown'
  })
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/arsip/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/arsip/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session && session.user.role === 'ADMIN') {
      fetchStats()
      setProfileData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }))
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const [usersRes, suratRes, disposisiRes] = await Promise.all([
        fetch('/api/users?limit=1'),
        fetch('/api/surat-masuk?limit=1'),
        fetch('/api/disposisi?limit=1')
      ])

      if (usersRes.ok && suratRes.ok && disposisiRes.ok) {
        const [usersData, suratData, disposisiData] = await Promise.all([
          usersRes.json(),
          suratRes.json(),
          disposisiRes.json()
        ])

        setStats({
          totalUsers: usersData.pagination?.total || 0,
          totalSurat: suratData.pagination?.total || 0,
          totalDisposisi: disposisiData.pagination?.total || 0,
          databaseSize: 'SQLite'
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      alert('Password baru dan konfirmasi password tidak sama')
      return
    }

    setLoading(true)
    
    try {
      const updateData: Record<string, string> = {
        name: profileData.name,
        email: profileData.email
      }

      if (profileData.newPassword) {
        updateData.password = profileData.newPassword
      }

      const response = await csrfFetch(`/api/users/${session?.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        alert('Profile berhasil diperbarui')
        setProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        const data = await response.json()
        alert(data.error || 'Gagal memperbarui profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const handleDatabaseReset = async () => {
    if (!confirm('PERINGATAN: Ini akan menghapus SEMUA data dalam sistem!\n\nApakah Anda yakin ingin melanjutkan?')) {
      return
    }

    if (!confirm('Konfirmasi sekali lagi: Semua surat masuk, disposisi, dan user (kecuali admin) akan dihapus permanen!')) {
      return
    }

    setLoading(true)
    
    try {
      // This is a placeholder - you might want to create a specific API endpoint for this
      alert('Fitur reset database belum diimplementasi. Gunakan Prisma Studio atau command line untuk reset manual.')
    } catch (error) {
      console.error('Error resetting database:', error)
      alert('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
              <p className="mt-1 text-sm text-gray-600">
                Kelola pengaturan sistem dan profile admin
              </p>
            </div>
            <Link
              href="/arsip/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Kembali
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* System Stats */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              <Database className="inline h-5 w-5 mr-2" />
              Statistik Sistem
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                <div className="text-sm text-gray-500">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalSurat}</div>
                <div className="text-sm text-gray-500">Surat Masuk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalDisposisi}</div>
                <div className="text-sm text-gray-500">Disposisi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.databaseSize}</div>
                <div className="text-sm text-gray-500">Database</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              <User className="inline h-5 w-5 mr-2" />
              Profile Admin
            </h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  <Lock className="inline h-4 w-4 mr-2" />
                  Ubah Password (Opsional)
                </h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Password Baru
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={profileData.newPassword}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="Kosongkan jika tidak ingin mengubah password"
                      />
                    </div>
                  </div>

                  {profileData.newPassword && (
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Konfirmasi Password Baru
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={profileData.confirmPassword}
                          onChange={handleProfileChange}
                          required={!!profileData.newPassword}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          placeholder="Ulangi password baru"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              <Info className="inline h-5 w-5 mr-2" />
              Informasi Sistem
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Versi Aplikasi</span>
                <span className="text-sm text-gray-500">1.0.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Framework</span>
                <span className="text-sm text-gray-500">Next.js 15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Database</span>
                <span className="text-sm text-gray-500">SQLite dengan Prisma ORM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Authentication</span>
                <span className="text-sm text-gray-500">NextAuth.js</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Terakhir Diperbarui</span>
                <span className="text-sm text-gray-500">Oktober 2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white shadow rounded-lg border border-red-200">
          <div className="px-6 py-4 border-b border-red-200 bg-red-50">
            <h3 className="text-lg font-medium text-red-900">
              <AlertTriangle className="inline h-5 w-5 mr-2" />
              Zona Berbahaya
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium text-gray-900">Reset Database</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Menghapus semua data dalam sistem termasuk surat masuk, disposisi, dan user (kecuali admin).
                  Tindakan ini tidak dapat dibatalkan.
                </p>
                <button
                  onClick={handleDatabaseReset}
                  disabled={loading}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Database
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Sistem Arsip Surat v1.0.0 - Dibuat dengan ❤️ menggunakan Next.js dan TypeScript</p>
        </div>
      </div>
    </div>
  )
}




