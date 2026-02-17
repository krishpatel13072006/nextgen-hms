import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, X, Bed, Users, DollarSign, Calendar, 
  CheckCircle, Clock, LogOut, Home, BarChart3,
  Trash2, Eye
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useCurrency, CurrencySelector } from '../context/CurrencyContext';

export default function Dashboard() {
  const { formatPrice } = useCurrency();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [occupancyRate, setOccupancyRate] = useState(0);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('rooms');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({
    number: '',
    type: 'Standard',
    price: '',
    capacity: 2,
    amenities: '',
    description: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        axios.get('https://nextgen-hms-backend.onrender.com/api/patients'),
        axios.get('https://nextgen-hms-backend.onrender.com/api/appointments')
      ]);
      setRooms(roomsRes.data.rooms || []);
      setOccupancyRate(roomsRes.data.occupancyRate || 0);
      setBookings(bookingsRes.data.bookings || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/');
  };

  const toggleAvailability = async (roomId) => {
    try {
      await axios.patch(`https://nextgen-hms-backend.onrender.com/api/patients/${roomId}/availability`);
      fetchData();
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Failed to update room status');
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const roomData = {
        number: newRoom.number,
        type: newRoom.type,
        price: parseFloat(newRoom.price),
        capacity: parseInt(newRoom.capacity),
        amenities: newRoom.amenities.split(',').map(a => a.trim()).filter(a => a),
        description: newRoom.description,
        isAvailable: true
      };
      
      await axios.post('https://nextgen-hms-backend.onrender.com/api/patients', roomData);
      setShowAddRoom(false);
      setNewRoom({ number: '', type: 'Standard', price: '', capacity: 2, amenities: '', description: '' });
      fetchData();
      alert('Room added successfully!');
    } catch (error) {
      console.error('Error adding room:', error);
      alert(error.response?.data?.message || 'Failed to add room');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    
    try {
      await axios.delete(`https://nextgen-hms-backend.onrender.com/api/patients/${roomId}`);
      fetchData();
      alert('Room deleted successfully!');
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room');
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.patch(`https://nextgen-hms-backend.onrender.com/api/appointments/${bookingId}/status`, { status });
      fetchData();
      alert(`Booking status updated to ${status}`);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await axios.patch(`https://nextgen-hms-backend.onrender.com/api/appointments/${bookingId}/cancel`);
      fetchData();
      alert('Booking cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors overflow-x-hidden">
      {/* Navigation Header */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-gray-900 dark:text-white text-xl font-bold">
              NextGen<span className="text-blue-500">HMS</span>
            </div>
            <div className="flex items-center gap-4">
              <CurrencySelector />
              <ThemeToggle />
              {user && (
                <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                  Hi, <span className="text-blue-500 dark:text-blue-400">{user.name}</span>
                </span>
              )}
              <a href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors flex items-center gap-1">
                <Home className="w-4 h-4" /> Home
              </a>
              <a href="/admin-dashboard" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors flex items-center gap-1">
                <BarChart3 className="w-4 h-4" /> Analytics
              </a>
              <button 
                onClick={handleLogout}
                className="text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-sm transition-colors flex items-center gap-1"
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manager Portal</h1>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Manage rooms and bookings</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
              <span className="text-gray-500 dark:text-gray-500 text-sm">Occupancy: </span>
              <span className="text-blue-500 dark:text-blue-400 font-semibold">{occupancyRate}%</span>
            </div>
            <button 
              onClick={() => setShowAddRoom(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Room
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'rooms' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
            }`}
          >
            <Bed className="w-4 h-4" />
            Rooms ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'bookings' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Bookings ({bookings.length})
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Bed className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-500 text-xs">Total Rooms</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{rooms.length}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-500 text-xs">Available</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{rooms.filter(r => r.isAvailable).length}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-500 text-xs">Occupied</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{rooms.filter(r => !r.isAvailable).length}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-500 text-xs">Revenue/Day</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(rooms.filter(r => !r.isAvailable).reduce((sum, r) => sum + (r.currentPrice || r.price), 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room, index) => (
              <motion.div 
                key={room._id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm dark:shadow-none"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      room.type === 'Standard' ? 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300' :
                      room.type === 'Deluxe' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                      room.type === 'Suite' ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' :
                      'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    }`}>
                      {room.type}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-1">Room {room.number}</h3>
                    <p className="text-gray-500 dark:text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                      <Users className="w-3 h-3" /> {room.capacity || 2} guests
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    room.isAvailable 
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-red-500/20 text-red-600 dark:text-red-400'
                  }`}>
                    {room.isAvailable ? 'Available' : 'Occupied'}
                  </span>
                </div>
                
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(room.currentPrice || room.price)}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-500">/night</span>
                    </p>
                  </div>
                </div>
                
                {room.amenities && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {room.amenities.slice(0, 3).map((amenity, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs text-gray-600 dark:text-gray-400">
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs text-gray-500 dark:text-gray-500">
                        +{room.amenities.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-slate-700">
                  <button 
                    onClick={() => toggleAvailability(room._id)}
                    className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                      room.isAvailable 
                        ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/30' 
                        : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30'
                    }`}
                  >
                    {room.isAvailable ? 'Mark Occupied' : 'Mark Available'}
                  </button>
                  <button 
                    onClick={() => handleDeleteRoom(room._id)}
                    className="p-1.5 bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
            
            {rooms.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Bed className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-500">No rooms found</p>
                <p className="text-gray-400 dark:text-gray-600 text-sm mt-1">Click "Add Room" to get started</p>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm dark:shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-slate-700/50">
                  <tr>
                    <th className="text-left p-3 text-gray-600 dark:text-gray-400 font-medium text-xs">Room</th>
                    <th className="text-left p-3 text-gray-600 dark:text-gray-400 font-medium text-xs">Type</th>
                    <th className="text-left p-3 text-gray-600 dark:text-gray-400 font-medium text-xs">Guest</th>
                    <th className="text-left p-3 text-gray-600 dark:text-gray-400 font-medium text-xs">Check In</th>
                    <th className="text-left p-3 text-gray-600 dark:text-gray-400 font-medium text-xs">Check Out</th>
                    <th className="text-left p-3 text-gray-600 dark:text-gray-400 font-medium text-xs">Total</th>
                    <th className="text-left p-3 text-gray-600 dark:text-gray-400 font-medium text-xs">Status</th>
                    <th className="text-left p-3 text-gray-600 dark:text-gray-400 font-medium text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-500 dark:text-gray-500">
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking, index) => (
                      <tr key={booking._id || index} className="border-t border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                        <td className="p-3 text-gray-900 dark:text-white text-sm">Room {booking.room?.number || 'N/A'}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400 text-sm">{booking.room?.type || 'N/A'}</td>
                        <td className="p-3 text-gray-900 dark:text-white text-sm">
                          {booking.user?.name || booking.specialRequests?.replace('Guest: ', '') || 'Guest'}
                        </td>
                        <td className="p-3 text-gray-600 dark:text-gray-400 text-sm">
                          {new Date(booking.checkIn).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-gray-600 dark:text-gray-400 text-sm">
                          {new Date(booking.checkOut).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                          {formatPrice(booking.totalPrice || 0)}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                            booking.status === 'checked-in' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                            booking.status === 'checked-out' ? 'bg-gray-500/20 text-gray-600 dark:text-gray-400' :
                            'bg-red-500/20 text-red-600 dark:text-red-400'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => updateBookingStatus(booking._id, 'checked-in')}
                                className="px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 rounded text-xs transition-colors"
                              >
                                Check In
                              </button>
                            )}
                            {booking.status === 'checked-in' && (
                              <button
                                onClick={() => updateBookingStatus(booking._id, 'checked-out')}
                                className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 rounded text-xs transition-colors"
                              >
                                Check Out
                              </button>
                            )}
                            {booking.status !== 'cancelled' && booking.status !== 'checked-out' && (
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                className="px-2 py-1 bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30 rounded text-xs transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      <AnimatePresence>
        {showAddRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddRoom(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Room</h3>
                <button onClick={() => setShowAddRoom(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddRoom} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Room Number</label>
                    <input
                      type="text"
                      required
                      value={newRoom.number}
                      onChange={(e) => setNewRoom({...newRoom, number: e.target.value})}
                      className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-blue-500 transition-colors"
                      placeholder="101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Room Type</label>
                    <select
                      value={newRoom.type}
                      onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}
                      className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-blue-500 transition-colors"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Suite">Suite</option>
                      <option value="Presidential">Presidential</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Price/Night ($)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newRoom.price}
                      onChange={(e) => setNewRoom({...newRoom, price: e.target.value})}
                      className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-blue-500 transition-colors"
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Capacity</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newRoom.capacity}
                      onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})}
                      className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Amenities (comma-separated)</label>
                  <input
                    type="text"
                    value={newRoom.amenities}
                    onChange={(e) => setNewRoom({...newRoom, amenities: e.target.value})}
                    className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-blue-500 transition-colors"
                    placeholder="WiFi, TV, Air Conditioning"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Description</label>
                  <textarea
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                    className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-blue-500 transition-colors resize-none"
                    rows="2"
                    placeholder="Room description..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add Room
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
