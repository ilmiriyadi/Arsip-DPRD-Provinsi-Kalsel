"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { csrfFetch } from "@/lib/csrfFetch"
import { Shield, Activity, AlertTriangle, CheckCircle } from "lucide-react"

interface AuditLog {
  id: string
  userId: string | null
  action: string
  entity: string | null
  entityId: string | null
  ipAddress: string | null
  userAgent: string | null
  details: string | null
  success: boolean
  createdAt: string
}

export default function AuditLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "failed-logins">("all")
  const [days, setDays] = useState(7)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: filter,
        days: days.toString(),
        limit: "100"
      })
      
      const response = await csrfFetch(`/api/audit-logs?${params}`)
      const data = await response.json()
      
      setLogs(data.logs || [])
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setLoading(false)
    }
  }, [filter, days])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/arsip/login")
    }
    if (session?.user.role !== "ADMIN") {
      router.push("/arsip/dashboard")
    }
  }, [session, status, router])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "LOGIN":
        return "bg-[#C8A348]/20 text-[#C8A348]"
      case "FAILED_LOGIN":
        return "bg-red-100 text-red-800"
      case "CREATE":
        return "bg-blue-100 text-blue-800"
      case "UPDATE":
        return "bg-yellow-100 text-yellow-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      case "EXPORT":
        return "bg-[#C8A348]/20 text-[#C8A348]"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const parseDetails = (details: string | null) => {
    if (!details) return null
    try {
      return JSON.parse(details)
    } catch {
      return details
    }
  }

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (session?.user.role !== "ADMIN") {
    return null
  }

  return (
    <DashboardLayout>
      <div className="civic-card civic-signature border-b border-[#E3E3E3] mb-6">
        <div className="mx-auto px-4 sm:px-6 lg:px-6">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#B82025] rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Merriweather, serif' }}>
                  Audit Logs
                </h1>
                <p className="mt-1 text-sm text-[#737373] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Monitor aktivitas dan keamanan sistem
                </p>
              </div>
            </div>
            <button
              onClick={fetchLogs}
              className="civic-btn-primary inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-6 space-y-6">

        {/* Filters */}
        <div className="civic-card bg-white rounded-2xl shadow-xl border border-[#E3E3E3] overflow-hidden">
          <div className="bg-[#F7F7F7] px-6 py-4 border-b border-[#E3E3E3]">
            <h3 className="text-lg font-semibold text-[#1A1A1A] flex items-center" style={{ fontFamily: 'Merriweather, serif' }}>
              <div className="w-8 h-8 bg-[#B82025] rounded-lg flex items-center justify-center mr-3">
                <Activity className="h-4 w-4 text-white" />
              </div>
              Filter Data
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Filter Aktivitas</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as "all" | "failed-logins")}
                  className="civic-input w-full px-4 py-3 text-base"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="all">Semua Aktivitas</option>
                  <option value="failed-logins">Failed Logins</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Periode Waktu</label>
                <select
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  className="civic-input w-full px-4 py-3 text-base"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="1">24 Jam Terakhir</option>
                  <option value="7">7 Hari Terakhir</option>
                  <option value="30">30 Hari Terakhir</option>
                  <option value="90">90 Hari Terakhir</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {logs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="civic-card bg-white rounded-2xl shadow-lg border border-[#E3E3E3] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>Total Events</p>
                  <p className="text-3xl font-bold text-[#1A1A1A] mt-2" style={{ fontFamily: 'Merriweather, serif' }}>{logs.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#1A1A1A] to-[#3A3A3A] rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="civic-card bg-white rounded-2xl shadow-lg border border-[#E3E3E3] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>Failed Logins</p>
                  <p className="text-3xl font-bold text-[#B82025] mt-2" style={{ fontFamily: 'Merriweather, serif' }}>
                    {logs.filter((l) => l.action === "FAILED_LOGIN").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#B82025] to-[#8B1A1F] rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="civic-card bg-white rounded-2xl shadow-lg border border-[#E3E3E3] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>Successful Logins</p>
                  <p className="text-3xl font-bold text-[#C8A348] mt-2" style={{ fontFamily: 'Merriweather, serif' }}>
                    {logs.filter((l) => l.action === "LOGIN").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data Changes</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {logs.filter((l) => ["CREATE", "UPDATE", "DELETE"].includes(l.action)).length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <Shield className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Tidak ada log ditemukan</p>
                        <p className="text-sm text-gray-400">Coba ubah filter atau periode waktu</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const details = parseDetails(log.details)
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(log.createdAt).toLocaleString("id-ID", {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.entity || "-"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block">
                            {log.ipAddress || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {details ? (
                            <details className="cursor-pointer">
                              <summary className="text-blue-600 hover:text-blue-800 text-sm hover:underline inline-flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>View</span>
                              </summary>
                              <pre className="mt-2 text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto font-mono">
{JSON.stringify(details, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.success ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#C8A348]/20 text-[#C8A348]">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}



