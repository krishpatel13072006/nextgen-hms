import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Check, Clock, AlertTriangle, 
  UtensilsCrossed, BrushCleaning, Wrench, MoreVertical,
  Filter, Search, ChevronDown, X, Play, Pause,
  TrendingUp, Users, Package, DollarSign
} from 'lucide-react';

const typeIcons = {
  Food: UtensilsCrossed,
  Housekeeping: BrushCleaning,
  Maintenance: Wrench,
  'Room Service': UtensilsCrossed,
  Other: Package
};

const typeColors = {
  Food: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Housekeeping: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Maintenance: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Room Service': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Other: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
};

const statusColors = {
  Pending: 'bg-yellow-500/20 text-yellow-400',
  'In Progress': 'bg-blue-500/20 text-blue-400',
  Completed: 'bg-emerald-500/20 text-emerald-400',
  Cancelled: 'bg-red-500/20 text-red-400'
};

const priorityColors = {
  Low: 'bg-slate-500/20 text-slate-400',
  Medium: 'bg-blue-500/20 text-blue-400',
  High: 'bg-orange-500/20 text-orange-400',
  Urgent: 'bg-red-500/20 text-red-400 animate-pulse'
};

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [requestsRes, statsRes] = await Promise.all([
        axios.get('https://nextgen-hms-backend.onrender.com/api/requests/all'),
        axios.get('https://nextgen-hms-backend.onrender.com/api/requests/stats')
      ]);
      setRequests(requestsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`https://nextgen-hms-backend.onrender.com/api/requests/${id}`, { status: newStatus });
      setRequests(requests.map(r => 
        r._id === id ? { ...r, status: newStatus } : r
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const bulkUpdate = async (status) => {
    if (selectedRequests.length === 0) return;
    try {
      await axios.patch('https://nextgen-hms-backend.onrender.com/api/requests/bulk/status', {
        ids: selectedRequests,
        status
      });
      setRequests(requests.map(r => 
        selectedRequests.includes(r._id) ? { ...r, status } : r
      ));
      setSelectedRequests([]);
    } catch (error) {
      console.error('Error bulk updating:', error);
    }
  };

  const filteredRequests = (requests || []).filter(req => {
    if (!req) return false;
    if (filterStatus !== 'all' && req.status !== filterStatus) return false;
    if (filterType !== 'all' && req.type !== filterType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        req.roomNumber?.toLowerCase().includes(query) ||
        req.item?.toLowerCase().includes(query) ||
        req.type?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const toggleSelect = (id) => {
    setSelectedRequests(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(r => r._id));
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold">
            Live <span className="text-blue-500">Service Feed</span>
          </h2>
          <p className="text-gray-400 mt-1">Real-time guest requests and orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-slate-900/50 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-xl">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.statusBreakdown.find(s => s._id === 'Pending')?.count || 0}
                </p>
                <p className="text-gray-500 text-sm">Pending</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-900/50 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Play className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.statusBreakdown.find(s => s._id === 'In Progress')?.count || 0}
                </p>
                <p className="text-gray-500 text-sm">In Progress</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-900/50 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-xl">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.statusBreakdown.find(s => s._id === 'Completed')?.count || 0}
                </p>
                <p className="text-gray-500 text-sm">Completed</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-900/50 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.todayTotal}</p>
                <p className="text-gray-500 text-sm">Today</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by room, item, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="Food">Food</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Room Service">Room Service</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl"
        >
          <span className="text-blue-400">{selectedRequests.length} selected</span>
          <div className="flex gap-2">
            <button
              onClick={() => bulkUpdate('In Progress')}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
            >
              Start All
            </button>
            <button
              onClick={() => bulkUpdate('Completed')}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm transition-colors"
            >
              Complete All
            </button>
            <button
              onClick={() => setSelectedRequests([])}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              Clear
            </button>
          </div>
        </motion.div>
      )}

      {/* Requests List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold mb-2">No requests found</h3>
          <p className="text-gray-400">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select All */}
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/30 rounded-xl">
            <input
              type="checkbox"
              checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
              onChange={selectAll}
              className="w-4 h-4 rounded border-gray-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-gray-400 text-sm">Select all ({filteredRequests.length})</span>
          </div>

          <AnimatePresence>
            {filteredRequests.map((req, index) => {
              const TypeIcon = typeIcons[req.type] || Package;
              return (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex items-center gap-4 p-5 bg-slate-900/50 border border-white/10 rounded-2xl hover:bg-slate-900/70 transition-colors ${
                    req.status === 'Completed' ? 'opacity-60' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedRequests.includes(req._id)}
                    onChange={() => toggleSelect(req._id)}
                    className="w-4 h-4 rounded border-gray-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                  />

                  {/* Type Icon */}
                  <div className={`p-2 rounded-xl ${typeColors[req.type] || 'bg-gray-500/20'}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${typeColors[req.type]}`}>
                        {req.type}
                      </span>
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${priorityColors[req.priority]}`}>
                        {req.priority}
                      </span>
                    </div>
                    <p className="text-lg font-semibold truncate">
                      Room {req.roomNumber}: {req.item || 'Service Request'}
                    </p>
                    {req.items && req.items.length > 0 && (
                      <p className="text-gray-500 text-sm truncate">
                        {req.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                    )}
                    {req.specialRequests && (
                      <p className="text-yellow-500/70 text-xs mt-1">
                        Note: {req.specialRequests}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  {req.total > 0 && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-400">${req.total}</p>
                    </div>
                  )}

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${statusColors[req.status]}`}>
                      {req.status}
                    </span>
                    
                    {req.status !== 'Completed' && (
                      <div className="flex gap-2">
                        {req.status === 'Pending' && (
                          <button
                            onClick={() => updateStatus(req._id, 'In Progress')}
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                            title="Start"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => updateStatus(req._id, 'Completed')}
                          className="p-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
                          title="Complete"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Time */}
                    <span className="text-gray-500 text-sm italic min-w-[60px] text-right">
                      {getTimeAgo(req.createdAt)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
