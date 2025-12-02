'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { csrfFetch } from '@/lib/csrfFetch'
import { 
  Settings, 
  Users, 
  Shield, 
  Edit,
  Trash2,
  Eye,
  EyeOff,
  UserPlus,
  XCircle,
  AlertCircle,
  Calendar
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MEMBER'
  createdAt: string
  updatedAt: string
}

interface UserFormData {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'MEMBER'
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'MEMBER'
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/arsip/login')
      return
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/arsip/dashboard')
      return
    }

    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await csrfFetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch users')
      }
    } catch {
      setError('Gagal memuat data pengguna')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await csrfFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowAddModal(false)
        setFormData({ name: '', email: '', password: '', role: 'MEMBER' })
        fetchUsers()
      } else {
        const data = await response.json()
        setError(data.error || 'Gagal menambahkan pengguna')
      }
    } catch {
      setError('Terjadi kesalahan saat menambahkan pengguna')
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      const response = await csrfFetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          ...(formData.password && { password: formData.password })
        })
      })

      if (response.ok) {
        setShowEditModal(false)
        setSelectedUser(null)
        setFormData({ name: '', email: '', password: '', role: 'MEMBER' })
        fetchUsers()
      } else {
        const data = await response.json()
        setError(data.error || 'Gagal mengupdate pengguna')
      }
    } catch {
      setError('Terjadi kesalahan saat mengupdate pengguna')
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      const response = await csrfFetch(`/api/users/${userToDelete}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setShowDeleteModal(false)
        setUserToDelete(null)
        fetchUsers()
      } else {
        const data = await response.json()
        setError(data.error || 'Gagal menghapus pengguna')
      }
    } catch {
      setError('Terjadi kesalahan saat menghapus pengguna')
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getRoleBadge = (role: string) => {
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200">
        <Users className="w-3 h-3 mr-1" />
        Member
      </span>
    )
  }



  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <DashboardLayout>
      <div className="civic-card civic-signature border-b border-[#E3E3E3]">
        <div className="mx-auto px-4 sm:px-6 lg:px-6">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#B82025] rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Merriweather, serif' }}>
                  Kelola Pengguna
                </h1>
                <p className="mt-1 text-sm text-[#737373] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Kelola akun pengguna dan hak akses sistem
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-[#B82025] text-[#B82025] px-6 py-4 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5" />
            <span style={{ fontFamily: 'Inter, sans-serif' }}>{error}</span>
            <button onClick={() => setError('')} className="ml-auto hover:opacity-70 civic-transition">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* User Management Content */}
        <div className="civic-card bg-white shadow-xl rounded-2xl border border-[#E3E3E3] overflow-hidden mb-8">
          <div className="p-6">
            <div>
                {/* Users Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center space-x-2" style={{ fontFamily: 'Merriweather, serif' }}>
                      <Users className="w-5 h-5" />
                      <span>Daftar Pengguna</span>
                    </h2>
                    <p className="text-[#737373] text-sm mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>Tambah, edit, dan kelola akun pengguna sistem</p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="civic-btn-primary inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tambah Pengguna
                  </button>
                </div>

                {/* Users Table */}
                <div className="bg-white shadow-lg rounded-xl border border-[#E3E3E3] overflow-hidden">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B82025]"></div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-[#F7F7F7] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-[#737373]" />
                      </div>
                      <h3 className="text-lg font-medium text-[#1A1A1A] mb-2" style={{ fontFamily: 'Merriweather, serif' }}>Belum ada pengguna</h3>
                      <p className="text-[#737373] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Mulai dengan menambahkan pengguna pertama.</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="civic-btn-primary inline-flex items-center px-4 py-2 rounded-xl shadow-lg"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Tambah Pengguna Pertama
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b border-[#E3E3E3]">
                              <th className="px-6 py-4 text-left text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider bg-[#F7F7F7]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                <div className="flex items-center space-x-2">
                                  <Users className="w-4 h-4" />
                                  <span>Pengguna</span>
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider bg-[#F7F7F7]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                <div className="flex items-center space-x-2">
                                  <Shield className="w-4 h-4" />
                                  <span>Role</span>
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider bg-[#F7F7F7]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>Terdaftar</span>
                                </div>
                              </th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider bg-[#F7F7F7]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                <div className="flex items-center justify-end space-x-2">
                                  <Settings className="w-4 h-4" />
                                  <span>Aksi</span>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E3E3E3]">
                            {users.map((user) => (
                              <tr key={user.id} className="group hover:bg-[#F7F7F7] civic-transition">
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-[#B82025] rounded-full flex items-center justify-center text-sm font-semibold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                                      {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-[#1A1A1A]" style={{ fontFamily: 'Inter, sans-serif' }}>{user.name}</div>
                                      <div className="text-[#737373] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{user.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  {getRoleBadge(user.role)}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-[#B82025] rounded-full"></div>
                                    <span className="text-sm font-medium text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                      {formatDate(user.createdAt)}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-end space-x-2">
                                    <button
                                      onClick={() => {
                                        setSelectedUser(user)
                                        setFormData({
                                          name: user.name,
                                          email: user.email,
                                          password: '',
                                          role: user.role
                                        })
                                        setShowEditModal(true)
                                      }}
                                      className="inline-flex items-center px-3 py-1.5 bg-[#F7F7F7] text-[#1A1A1A] text-xs font-medium rounded-lg border border-[#E3E3E3] hover:bg-white hover:border-[#B82025] hover:text-[#B82025] civic-transition"
                                      style={{ fontFamily: 'Inter, sans-serif' }}
                                      title="Edit pengguna"
                                    >
                                      <Edit className="w-3 h-3 mr-1.5" />
                                      <span>Edit</span>
                                    </button>
                                    {user.id !== session?.user.id && (
                                      <button
                                        onClick={() => {
                                          setUserToDelete(user.id)
                                          setShowDeleteModal(true)
                                        }}
                                        className="inline-flex items-center px-3 py-1.5 bg-[#F7F7F7] text-[#B82025] text-xs font-medium rounded-lg border border-[#E3E3E3] hover:bg-[#B82025] hover:text-white civic-transition"
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                        title="Hapus pengguna"
                                      >
                                        <Trash2 className="w-3 h-3 mr-1.5" />
                                        <span>Hapus</span>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
          </div>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <UserPlus className="w-5 h-5" />
                    <span>Tambah Pengguna</span>
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      placeholder="Masukkan alamat email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2.5 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        placeholder="Masukkan password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'MEMBER' })}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
                    >
                      Tambah
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <Edit className="w-5 h-5" />
                    <span>Edit Pengguna</span>
                  </h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleEditUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      placeholder="Masukkan alamat email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password Baru (opsional)</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2.5 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        placeholder="Kosongkan jika tidak ingin mengubah"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'MEMBER' })}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete User Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <span>Hapus Pengguna</span>
                  </h2>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-center text-slate-700">
                    Apakah Anda yakin ingin menghapus pengguna ini? 
                    <br />
                    <span className="font-semibold">Tindakan ini tidak dapat dibatalkan.</span>
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200"
                  >
                    Ya, Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}




