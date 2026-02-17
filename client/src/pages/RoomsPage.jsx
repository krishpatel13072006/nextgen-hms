import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import RoomCard from '../components/RoomCard';
import RoomAvailabilityCalendar from '../components/RoomAvailabilityCalendar';
import { Search, SlidersHorizontal, X, Calendar } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useCurrency, CurrencySelector } from '../context/CurrencyContext';

export default function RoomsPage() {
  const { formatPrice } = useCurrency();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [priceRange, setPriceRange] = useState(1000);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const amenitiesList = ['WiFi', 'TV', 'Mini Bar', 'Air Conditioning', 'Balcony', 'Room Service', 'Ocean View', 'Jacuzzi'];

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await axios.get('https://nextgen-hms-backend.onrender.com/api/patients');
        setRooms(data.rooms || data);
        setFilteredRooms(data.rooms || data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Filter Logic
  useEffect(() => {
    if (!rooms || rooms.length === 0) {
      setFilteredRooms([]);
      return;
    }

    let result = [...rooms];

    // Price filter
    result = result.filter(room => (room?.currentPrice || room?.price || 0) <= priceRange);

    // Type filter
    if (selectedType !== 'All') {
      result = result.filter(room => room?.type === selectedType);
    }

    // Amenities filter
    if (selectedAmenities.length > 0) {
      result = result.filter(room => 
        selectedAmenities.every(amenity => 
          room?.amenities?.some(a => a?.toLowerCase().includes(amenity.toLowerCase()))
        )
      );
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(room => 
        room?.number?.toString().includes(query) ||
        room?.type?.toLowerCase().includes(query) ||
        room?.description?.toLowerCase().includes(query)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'price') {
        return (a?.currentPrice || a?.price || 0) - (b?.currentPrice || b?.price || 0);
      } else if (sortBy === 'price-desc') {
        return (b?.currentPrice || b?.price || 0) - (a?.currentPrice || a?.price || 0);
      } else if (sortBy === 'type') {
        return (a?.type || '').localeCompare(b?.type || '');
      }
      return 0;
    });

    setFilteredRooms(result);
  }, [priceRange, selectedType, selectedAmenities, rooms, searchQuery, sortBy]);

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setPriceRange(1000);
    setSelectedType('All');
    setSelectedAmenities([]);
    setSearchQuery('');
    setSortBy('price');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white transition-colors overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-100 dark:from-slate-900 via-blue-100 dark:via-blue-900/20 to-gray-100 dark:to-slate-900 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-center gap-4"
          >
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                Explore Our <span className="text-blue-500">Rooms</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Find the perfect room for your stay</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <CurrencySelector/>
              <ThemeToggle/>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Mobile Filter Toggle */}
        <div className="flex gap-2 m-4 lg:m-0">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 lg:hidden flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          <button 
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex-1 lg:hidden flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none"
          >
            <Calendar className="w-5 h-5" />
            {showCalendar ? 'Hide Calendar' : 'Availability'}
          </button>
        </div>

        {/* Filter Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 p-6 lg:border-r border-gray-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 lg:bg-transparent`}>
          <div className="lg:sticky lg:top-24">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-blue-500">Filters</h3>
              <button 
                onClick={clearFilters}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm mb-2 text-gray-600 dark:text-gray-400">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input 
                  type="text"
                  placeholder="Room number, type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-8">
              <label className="block text-sm mb-2 text-gray-600 dark:text-gray-400">
                Max Price: <span className="text-gray-900 dark:text-white font-bold">{formatPrice(priceRange)}</span>
              </label>
              <input 
                type="range" 
                min="50" 
                max="1000" 
                step="10" 
                value={priceRange} 
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                <span>{formatPrice(50)}</span>
                <span>{formatPrice(1000)}</span>
              </div>
            </div>

            {/* Room Type */}
            <div className="mb-8">
              <label className="block text-sm mb-2 text-gray-600 dark:text-gray-400">Room Type</label>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-white"
              >
                <option value="All">All Types</option>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Presidential">Presidential</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="mb-8">
              <label className="block text-sm mb-2 text-gray-600 dark:text-gray-400">Sort By</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-white"
              >
                <option value="price">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="type">Type (A-Z)</option>
              </select>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm mb-3 text-gray-600 dark:text-gray-400">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {amenitiesList.map(amenity => (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                      selectedAmenities.includes(amenity)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-300 dark:border-transparent'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Room Grid */}
        <main className="flex-1 p-6">
          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Showing <span className="text-gray-900 dark:text-white font-bold">{filteredRooms.length}</span> rooms
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">?</div>
              <h3 className="text-xl font-bold mb-2">No rooms found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your filters</p>
              <button 
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {showCalendar && (
                <div className="mb-6">
                  <RoomAvailabilityCalendar rooms={rooms} />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredRooms.map((room, index) => (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <RoomCard room={room} />
                </motion.div>
              ))}
            </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
