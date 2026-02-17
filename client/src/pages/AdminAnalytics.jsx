import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '../components/ImageUpload';
import RoomManagement from '../components/RoomManagement';
import { useCurrency, CurrencySelector } from '../context/CurrencyContext';
import { 
  DollarSign, Percent, Bed, CheckCircle, TrendingUp, Users, Calendar, 
  ArrowUpRight, LogOut, Home, LayoutDashboard, RefreshCw, Download,
  Clock, Star, ArrowUp, ArrowDown, X, FileText, Image
} from 'lucide-react';

export default function AdminAnalytics() {
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchStats();
    fetchBookings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/');
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('https://nextgen-hms-backend.onrender.com/api/analytics/stats');
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get('https://nextgen-hms-backend.onrender.com/api/appointments');
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleExportReport = async () => {
    setExporting(true);
    try {
      const csvContent = generateCSVReport();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hotel-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const generateCSVReport = () => {
    const headers = ['Room', 'Type', 'Guest', 'Check In', 'Check Out', 'Total Price', 'Status'];
    const rows = bookings.map(b => [
      b.room?.number || 'N/A',
      b.room?.type || 'N/A',
      b.user?.name || b.specialRequests?.replace('Guest: ', '') || 'Guest',
      new Date(b.checkIn).toLocaleDateString(),
      new Date(b.checkOut).toLocaleDateString(),
      b.totalPrice || 0,
      b.status
    ]);
    
    const csv = [
      'HOTEL ANALYTICS REPORT',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'SUMMARY',
      `Total Revenue,${stats?.totalRevenue || 0}`,
      `Occupancy Rate,${stats?.occupancyRate}%`,
      `Total Rooms,${stats?.totalRooms}`,
      `Available Rooms,${stats?.availableRooms}`,
      '',
      'BOOKINGS',
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    return csv;
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.patch(`https://nextgen-hms-backend.onrender.com/api/appointments/${bookingId}/status`, { status });
      fetchStats();
      fetchBookings();
      alert(`Booking status updated to ${status}`);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Unable to load analytics.</p>
          <button 
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const cards = [
    { 
      title: "Total Revenue", 
      value: formatPrice(stats.totalRevenue || 0), 
      icon: <DollarSign className="w-5 h-5" />, 
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20"
    },
    { 
      title: "Occupancy Rate", 
      value: `${stats.occupancyRate}%`, 
      icon: <Percent className="w-5 h-5" />, 
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    },
    { 
      title: "Total Rooms", 
      value: stats.totalRooms, 
      icon: <Bed className="w-5 h-5" />, 
      color: "text-purple-400",
      bgColor: "bg-purple-500/20"
    },
    { 
      title: "Available Now", 
      value: stats.availableRooms, 
      icon: <CheckCircle className="w-5 h-5" />, 
      color: "text-orange-400",
      bgColor: "bg-orange-500/20"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden">
      {/* Navigation Header */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-white text-xl font-bold">
              NextGen<span className="text-blue-500">HMS</span>
            </div>
            <div className="flex items-center gap-4">
              <CurrencySelector />
              {user && (
                <span className="text-sm text-gray-400 hidden sm:block">
                  Hi, <span className="text-blue-400">{user.name}</span>
                  <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">Admin</span>
                </span>
              )}
              <a href="/" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-1">
                <Home className="w-4 h-4" /> Home
              </a>
              <a href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </a>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 text-sm transition-colors flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Real-time insights and statistics</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { fetchStats(); fetchBookings(); }}
              className="px-3 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg text-sm text-gray-300 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button 
              onClick={handleExportReport}
              disabled={exporting}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card, i) => (
            <div 
              key={i} 
              className="p-4 bg-slate-800 border border-slate-700 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 ${card.bgColor} rounded-lg`}>
                  <span className={card.color}>{card.icon}</span>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">{card.title}</p>
                  <p className="text-xl font-bold text-white">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Occupancy Bar */}
          <div className="lg:col-span-2 p-6 bg-slate-800 border border-slate-700 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white">Real-time Capacity</h3>
              <span className="text-sm text-gray-400">{stats.occupancyRate}% Occupied</span>
            </div>
            <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${stats.occupancyRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>

            {/* Room Status */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{stats.availableRooms}</p>
                <p className="text-xs text-gray-500">Available</p>
              </div>
              <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                <Clock className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{stats.occupiedRooms}</p>
                <p className="text-xs text-gray-500">Occupied</p>
              </div>
              <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                <Star className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{stats.totalBookings || 0}</p>
                <p className="text-xs text-gray-500">Bookings</p>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Image className="w-5 h-5" />
                Image Upload
              </h3>
              <button
                onClick={() => setShowImageUpload(!showImageUpload)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white transition-colors"
              >
                {showImageUpload ? 'Hide' : 'Show'}
              </button>
            </div>
            {showImageUpload && (
              <ImageUpload
                uploadedImages={uploadedImages}
                setUploadedImages={setUploadedImages}
                maxImages={5}
              />
            )}
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Uploaded Images:</p>
                <div className="flex flex-wrap gap-2">
                  {uploadedImages.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img.url} alt="uploaded" className="w-20 h-20 object-cover rounded-lg" />
                      <button
                        onClick={() => setUploadedImages(uploadedImages.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Room Management */}
          <div className="mb-8">
            <RoomManagement />
          </div>

          {/* Recent Activity */}
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl">
            <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking, i) => (
                <div key={booking._id || i} className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    booking.status === 'confirmed' ? 'bg-blue-400' :
                    booking.status === 'checked-in' ? 'bg-emerald-400' :
                    booking.status === 'checked-out' ? 'bg-gray-400' :
                    'bg-red-400'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{booking.status === 'confirmed' ? 'New booking' : booking.status}</p>
                    <p className="text-xs text-gray-500">Room {booking.room?.number || 'N/A'}</p>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
              {bookings.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Room Types */}
        {stats.roomTypes && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Object.entries(stats.roomTypes).map(([type, data]) => (
              <div key={type} className="p-4 bg-slate-800 border border-slate-700 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-400">{type}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    data.available > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {data.available > 0 ? `${data.available} free` : 'Full'}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total</span>
                    <span className="text-white">{formatPrice(data.total || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Revenue</span>
                    <span className="text-blue-400">{formatPrice(data.revenue || 0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl">
          <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <a 
              href="/dashboard" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Manage Rooms
            </a>
            <button 
              onClick={() => setShowBookingsModal(true)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              View All Bookings
            </button>
            <button 
              onClick={() => setShowRevenueModal(true)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Revenue Reports
            </button>
            <button 
              onClick={handleExportReport}
              disabled={exporting}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Modal */}
      <AnimatePresence>
        {showBookingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBookingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">All Bookings</h3>
                <button onClick={() => setShowBookingsModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {bookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No bookings found</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="text-left p-2 text-gray-400 font-medium">Room</th>
                        <th className="text-left p-2 text-gray-400 font-medium">Guest</th>
                        <th className="text-left p-2 text-gray-400 font-medium">Check In</th>
                        <th className="text-left p-2 text-gray-400 font-medium">Check Out</th>
                        <th className="text-left p-2 text-gray-400 font-medium">Total</th>
                        <th className="text-left p-2 text-gray-400 font-medium">Status</th>
                        <th className="text-left p-2 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking, index) => (
                        <tr key={booking._id || index} className="border-t border-slate-700 hover:bg-slate-700/30">
                          <td className="p-2 text-white">Room {booking.room?.number || 'N/A'}</td>
                          <td className="p-2 text-gray-300">{booking.user?.name || 'Guest'}</td>
                          <td className="p-2 text-gray-400">{new Date(booking.checkIn).toLocaleDateString()}</td>
                          <td className="p-2 text-gray-400">{new Date(booking.checkOut).toLocaleDateString()}</td>
                          <td className="p-2 text-emerald-400">{formatPrice(booking.totalPrice || 0)}</td>
                          <td className="p-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              booking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                              booking.status === 'checked-in' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              {booking.status === 'confirmed' && (
                                <button
                                  onClick={() => updateBookingStatus(booking._id, 'checked-in')}
                                  className="px-2 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded text-xs transition-colors"
                                >
                                  Check In
                                </button>
                              )}
                              {booking.status === 'checked-in' && (
                                <button
                                  onClick={() => updateBookingStatus(booking._id, 'checked-out')}
                                  className="px-2 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-xs transition-colors"
                                >
                                  Check Out
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revenue Modal */}
      <AnimatePresence>
        {showRevenueModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRevenueModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">Revenue Reports</h3>
                <button onClick={() => setShowRevenueModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-gray-500 text-xs mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-emerald-400">{formatPrice(stats.totalRevenue || 0)}</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-gray-500 text-xs mb-1">Current Revenue</p>
                    <p className="text-2xl font-bold text-blue-400">{formatPrice(stats.currentRevenue || 0)}</p>
                  </div>
                </div>

                <h4 className="font-medium text-white mb-3">Revenue by Room Type</h4>
                <div className="space-y-3">
                  {stats.roomTypes && Object.entries(stats.roomTypes).map(([type, data]) => (
                    <div key={type} className="flex items-center gap-3">
                      <span className="w-20 text-sm text-gray-400">{type}</span>
                      <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ 
                            width: `${stats.totalRevenue > 0 ? (data.revenue / stats.totalRevenue) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="w-16 text-right text-sm text-white">{formatPrice(data.revenue || 0)}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleExportReport}
                  disabled={exporting}
                  className="w-full mt-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {exporting ? 'Exporting...' : 'Export Full Report'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
