import { useState, useEffect } from 'react'
import axios from 'axios'
import { Calendar, Clock, User, Mail, Phone, CheckCircle, Sparkles, Shield, Zap, Star } from 'lucide-react'
import { getTheme } from '../themes'
import ChatFlow from '../components/ChatFlow'
import chatflowConfig from '../chatflow-config.json'

const API_URL = import.meta.env.VITE_API_URL || '/api'
const BUSINESS_ID = 'default'

function BookingPage() {
  const [settings, setSettings] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    service_type: '',
    notes: ''
  })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState(getTheme('medical'))

  useEffect(() => {
    loadSettings()
    const savedTheme = localStorage.getItem('bookingTheme') || 'medical'
    setTheme(getTheme(savedTheme))
  }, [])

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots()
    }
  }, [selectedDate])

  const loadSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/business-settings/${BUSINESS_ID}`)
      setSettings(res.data)
      if (res.data.services?.length > 0) {
        setFormData(prev => ({ ...prev, service_type: res.data.services[0] }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const loadAvailableSlots = async () => {
    try {
      const res = await axios.get(`${API_URL}/available-slots/${BUSINESS_ID}`, {
        params: { date: selectedDate }
      })
      setAvailableSlots(res.data.available_slots || [])
    } catch (error) {
      console.error('Error loading slots:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedSlot) {
      alert('Please select a time slot')
      return
    }

    setLoading(true)
    try {
      await axios.post(`${API_URL}/appointment`, {
        ...formData,
        appointment_date: selectedDate,
        appointment_time: selectedSlot,
        business_id: BUSINESS_ID
      })
      setSuccess(true)
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (error) {
      alert(error.response?.data?.detail || 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  if (!settings) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
          <Sparkles className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.gradient} flex items-center justify-center p-4 relative overflow-hidden`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="text-center animate-in fade-in duration-700 zoom-in-50 relative z-10">
          <div className="inline-block p-8 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl mb-6 animate-bounce border border-white/50">
            <CheckCircle className="w-24 h-24 text-green-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-5xl font-bold text-gray-800 mb-4 animate-in slide-in-from-top duration-500">
            🎉 Appointment Confirmed!
          </h2>
          <p className="text-xl text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
            Your appointment has been successfully scheduled. You'll receive a confirmation email shortly.
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="px-4 py-2 bg-white/70 backdrop-blur-xl rounded-full shadow-lg border border-white/50 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">HIPAA Secure</span>
            </div>
            <div className="px-4 py-2 bg-white/70 backdrop-blur-xl rounded-full shadow-lg border border-white/50 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-semibold text-gray-700">Instant Confirmation</span>
            </div>
            <div className="px-4 py-2 bg-white/70 backdrop-blur-xl rounded-full shadow-lg border border-white/50 flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">Premium Service</span>
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${theme.buttonGradient} text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all`}>
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold text-lg">Confirmation Sent</span>
          </div>
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Background */}
      {theme.useHeroImage && theme.heroImage ? (
        <>
          <div 
            className="fixed inset-0 z-0 bg-cover bg-center transform scale-105"
            style={{ backgroundImage: `url(${theme.heroImage})` }}
          />
          <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        </>
      ) : (
        <div className={`fixed inset-0 z-0 bg-gradient-to-br ${theme.gradient}`} />
      )}

      {/* Floating Decorative Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-64 h-64 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 -right-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 py-12 px-4">
        {/* Hero Section - Premium 2026 Style */}
        <div className="max-w-5xl mx-auto text-center mb-16 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/10 backdrop-blur-2xl rounded-full border border-white/30 shadow-2xl animate-in zoom-in-50 duration-500">
            <span className="text-7xl drop-shadow-2xl">{theme.icon}</span>
          </div>
          
          <h1 className={`text-6xl sm:text-7xl font-bold mb-6 drop-shadow-2xl ${theme.useHeroImage ? 'text-white' : 'text-gray-800'} tracking-tight`}>
            {settings.business_name}
          </h1>
          
          <p className={`text-xl sm:text-2xl mb-8 drop-shadow-lg ${theme.useHeroImage ? 'text-gray-100' : 'text-gray-600'} max-w-2xl mx-auto leading-relaxed`}>
            {settings.booking_instructions}
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className={`flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 shadow-lg ${theme.useHeroImage ? 'text-white' : 'text-gray-700'}`}>
              <Shield className="w-4 h-4" />
              <span className="font-semibold">HIPAA Compliant</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 shadow-lg ${theme.useHeroImage ? 'text-white' : 'text-gray-700'}`}>
              <Zap className="w-4 h-4" />
              <span className="font-semibold">Instant Booking</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 shadow-lg ${theme.useHeroImage ? 'text-white' : 'text-gray-700'}`}>
              <Star className="w-4 h-4" />
              <span className="font-semibold">Premium Service</span>
            </div>
          </div>
        </div>

        {/* Booking Form - Bento Grid Style */}
        <div className="max-w-5xl mx-auto">
          <div className={`${theme.cardBg} backdrop-blur-3xl rounded-3xl ${theme.useHeroImage ? 'shadow-2xl border-2 border-white/20' : 'shadow-2xl border-2 border-white/30'} p-8 sm:p-12 animate-in fade-in slide-in-from-bottom duration-700`}>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Service Selection - Bento Card */}
              <div className="bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-left duration-500">
                <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  Select Service
                </label>
                <select
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md text-base font-medium"
                  required
                >
                  {settings.services.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              {/* Date & Time - Split Bento Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Date Selection */}
                <div className="bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-left duration-500 delay-100">
                  <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    Select Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setSelectedSlot('')
                    }}
                    className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm hover:shadow-md text-base font-medium"
                    required
                  />
                </div>

                {/* Time Selection Preview */}
                <div className="bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-right duration-500 delay-100">
                  <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    Selected Time
                  </label>
                  <div className="px-5 py-4 bg-white/60 backdrop-blur-sm rounded-xl border-2 border-dashed border-gray-300 text-center">
                    {selectedSlot ? (
                      <span className="text-lg font-bold text-gray-800">{selectedSlot}</span>
                    ) : (
                      <span className="text-gray-500">Select a date first</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Time Slots Grid */}
              {selectedDate && (
                <div className="bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg animate-in fade-in zoom-in-95 duration-500">
                  <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    Available Time Slots
                  </label>
                  {availableSlots.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 text-base">No available slots for this date</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {availableSlots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                            selectedSlot === slot
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 scale-105'
                              : 'bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 hover:border-indigo-400 hover:shadow-md'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Customer Details - Bento Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-left duration-500 delay-200">
                  <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-500/30 focus:border-pink-500 transition-all shadow-sm hover:shadow-md text-base font-medium placeholder:text-gray-400"
                    required
                  />
                </div>

                {/* Email */}
                <div className="bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-right duration-500 delay-200">
                  <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-sm hover:shadow-md text-base font-medium placeholder:text-gray-400"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-left duration-500 delay-300">
                  <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/30 focus:border-green-500 transition-all shadow-sm hover:shadow-md text-base font-medium placeholder:text-gray-400"
                    required
                  />
                </div>

                {/* Notes - Spans 2 columns on desktop */}
                <div className="md:col-span-2 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-bottom duration-500 delay-300">
                  <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="4"
                    placeholder="Any special requests or information..."
                    className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all shadow-sm hover:shadow-md text-base font-medium resize-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Submit Button - Premium CTA */}
              <button
                type="submit"
                disabled={loading || !selectedSlot}
                className={`w-full py-6 rounded-2xl font-bold text-lg shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-bottom duration-500 delay-400 bg-gradient-to-r ${theme.buttonGradient} text-white relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                {loading ? (
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-lg">Booking Your Appointment...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                    <span className="text-lg">Book Appointment Now</span>
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </span>
                )}
              </button>
            </form>

            {/* Footer Info - Premium Card */}
            <div className="mt-10 pt-10 border-t-2 border-gray-200/50">
              <div className="bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-xl p-8 rounded-2xl border border-white/50 shadow-lg">
                <p className="font-bold text-gray-800 mb-3 flex items-center gap-3 text-lg">
                  <span className="text-3xl">📋</span>
                  Cancellation Policy
                </p>
                <p className="text-gray-600 leading-relaxed text-base">{settings.cancellation_policy}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Blitz AI Widget */}
      <ChatFlow config={chatflowConfig} />
    </div>
  )
}

export default BookingPage
