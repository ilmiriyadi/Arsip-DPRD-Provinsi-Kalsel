"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/DashboardLayout"

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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
    if (session?.user.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [session, status, router])

  useEffect(() => {
    fetchLogs()
  }, [filter, days])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: filter,
        days: days.toString(),
        limit: "100"
      })
      
      const response = await fetch(`/api/audit-logs?${params}`)
      const data = await response.json()
      
      setLogs(data.logs || [])
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "LOGIN":
        return "bg-green-100 text-green-800"
      case "FAILED_LOGIN":
        return "bg-red-100 text-red-800"
      case "CREATE":
        return "bg-blue-100 text-blue-800"
      case "UPDATE":
        return "bg-yellow-100 text-yellow-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      case "EXPORT":
        return "bg-purple-100 text-purple-800"
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Filter</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">Semua Activity</option>
                <option value="failed-logins">Failed Logins</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Periode</label>
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="1">24 Jam</option>
                <option value="7">7 Hari</option>
                <option value="30">30 Hari</option>
                <option value="90">90 Hari</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Waktu</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Entity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">IP Address</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Details</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada log ditemukan
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const details = parseDetails(log.details)
                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          {new Date(log.createdAt).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{log.entity || "-"}</td>
                        <td className="px-4 py-3 text-sm font-mono text-xs">
                          {log.ipAddress || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm max-w-xs truncate">
                          {details ? (
                            <details className="cursor-pointer">
                              <summary className="text-blue-600 hover:underline">
                                View details
                              </summary>
                              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                {JSON.stringify(details, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {log.success ? (
                            <span className="text-green-600 text-xs">✓ Success</span>
                          ) : (
                            <span className="text-red-600 text-xs">✗ Failed</span>
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

        {/* Summary Stats */}
        {logs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Total Events</div>
              <div className="text-2xl font-bold">{logs.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Failed Logins</div>
              <div className="text-2xl font-bold text-red-600">
                {logs.filter((l) => l.action === "FAILED_LOGIN").length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Successful Logins</div>
              <div className="text-2xl font-bold text-green-600">
                {logs.filter((l) => l.action === "LOGIN").length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Data Changes</div>
              <div className="text-2xl font-bold text-blue-600">
                {logs.filter((l) => ["CREATE", "UPDATE", "DELETE"].includes(l.action)).length}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
