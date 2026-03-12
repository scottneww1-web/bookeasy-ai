import { useState, useEffect } from 'react'
import axios from 'axios'
import { Calendar, BarChart3, Clock, CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || '/api'
const BUSINESS_ID = 'default'

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('appointments')
  const [appointments, setAppointments] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [aptsRes, analyticsRes, settingsRes] = await Promise.all([
        axios.get(`${API_URL}/appointments/${BUSINESS_ID}`),
        axios.get(`${API_URL}/analytics/${BUSINESS_ID}`),
        axios.get(`${API_URL}/business-settings/${BUSINESS_ID}`)
      ])
      setAppointments(aptsRes.data.appointments)
      setAnalytics(analyticsRes.data)
      setSettings(settingsRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (appointmentId, status) => {
    try {
      await axios.patch(`${API_URL}/appointment/${appointmentId}/status?status=${status}`)
      loadData()
    } catch (error) {
      alert('Failed to update status')
    }
  }

  const saveSettings = async () => {
    try {
      await axios.post(`${API_URL}/business-settings`, settings)
      alert('Settings saved successfully!')
    } catch (error) {
      alert('Failed to save settings')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-3 font-medium flex items-center gap-2 ${
              activeTab === 'appointments'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-medium flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{apt.customer_name}</div>
                      {apt.notes && <div className="text-sm text-gray-500">{apt.notes}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{apt.service_type}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{apt.appointment_date}</div>
                      <div className="text-sm text-gray-500">{apt.appointment_time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{apt.customer_email}</div>
                      <div className="text-sm text-gray-500">{apt.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(apt.id, 'confirmed')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Confirm"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {apt.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(apt.id, 'completed')}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Complete"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                          <button
                            onClick={() => updateStatus(apt.id, 'cancelled')}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Cancel"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No appointments yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-800">{analytics.total_bookings}</p>
                </div>
                <Calendar className="w-10 h-10 text-indigo-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{analytics.by_status.pending}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Confirmed</p>
                  <p className="text-3xl font-bold text-green-600">{analytics.by_status.confirmed}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-blue-600">{analytics.completion_rate}%</p>
                </div>
                <BarChart3 className="w-10 h-10 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Services Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bookings by Service</h3>
            <div className="space-y-3">
              {Object.entries(analytics.by_service).map(([service, count]) => (
                <div key={service} className="flex items-center justify-between">
                  <span className="text-gray-700">{service}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${(count / analytics.total_bookings) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && settings && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Business Settings</h2>
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={settings.business_name}
                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time</label>
                <input
                  type="time"
                  value={settings.business_hours_start}
                  onChange={(e) => setSettings({ ...settings, business_hours_start: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time</label>
                <input
                  type="time"
                  value={settings.business_hours_end}
                  onChange={(e) => setSettings({ ...settings, business_hours_end: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slot Duration (minutes)</label>
              <input
                type="number"
                value={settings.slot_duration}
                onChange={(e) => setSettings({ ...settings, slot_duration: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Services (comma separated)</label>
              <input
                type="text"
                value={settings.services.join(', ')}
                onChange={(e) => setSettings({ ...settings, services: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Booking Instructions</label>
              <textarea
                value={settings.booking_instructions}
                onChange={(e) => setSettings({ ...settings, booking_instructions: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Policy</label>
              <textarea
                value={settings.cancellation_policy}
                onChange={(e) => setSettings({ ...settings, cancellation_policy: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={saveSettings}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
