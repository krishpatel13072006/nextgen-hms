import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AIConcierge from './components/AIConcierge';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './pages/Dashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import RoomsPage from './pages/RoomsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import AdminRequests from './pages/AdminRequests';
import { CurrencyProvider } from './context/CurrencyContext';
import ThemeToggle from './components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, Sparkles, Users, BedDouble, Calendar, BarChart3, Image, Mail, Shield, Clock, MessageCircle, Menu } from 'lucide-react';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Landing Page Component
function LandingPage() {
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    window.location.href = '/';
  };
  
  const features = [
    {
      icon: MessageCircle,
      title: "AI Concierge",
      description: "24/7 AI-powered chatbot for guest inquiries, bookings, and recommendations",
      useEffect: "Uses React state for message history and axios for API calls to /api/ai/chat endpoint",
      color: "blue"
    },
    {
      icon: Users,
      title: "User Authentication",
      description: "Secure JWT-based authentication with registration, login, and profile management",
      useEffect: "Stores token and user data in localStorage, validates on protected routes",
      color: "emerald"
    },
    {
      icon: BedDouble,
      title: "Room Management",
      description: "Browse rooms by type, view availability calendar, and manage bookings",
      useEffect: "Fetches room data from /api/patients, displays real-time availability",
      color: "purple"
    },
    {
      icon: Calendar,
      title: "Booking System",
      description: "Create, view, and cancel reservations with automatic status updates",
      useEffect: "POST to /api/booking/book-room, manages room availability states",
      color: "orange"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Real-time occupancy rates, revenue tracking, and booking analytics",
      useEffect: "Aggregates booking data, calculates occupancy from MongoDB queries",
      color: "cyan"
    },
    {
      icon: Image,
      title: "Image Upload",
      description: "Cloudinary-powered image upload for room photos with drag-and-drop",
      useEffect: "Multer for file handling, Cloudinary SDK for cloud storage",
      color: "pink"
    },
    {
      icon: Mail,
      title: "Email Notifications",
      description: "Automated booking confirmations and updates via SMTP email service",
      useEffect: "Nodemailer for email, sends async confirmations after booking",
      color: "yellow"
    },
    {
      icon: Shield,
      title: "Admin Controls",
      description: "Role-based access control with admin dashboard and request management",
      useEffect: "ProtectedRoute component checks user.role for admin permissions",
      color: "red"
    },
    {
      icon: Clock,
      title: "Smart Check-In",
      description: "Digital check-in/out system with time-based room management",
      useEffect: "Date-based booking validation, automatic status transitions",
      color: "teal"
    },
    {
      icon: BookOpen,
      title: "User Profile",
      description: "View and edit profile information, change password, view booking history",
      useEffect: "PATCH /api/auth/profile for updates, fetches user bookings by ID",
      color: "violet"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-500', hoverBg: 'hover:bg-blue-500/30' },
      emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-500', hoverBg: 'hover:bg-emerald-500/30' },
      purple: { bg: 'bg-purple-500/20', text: 'text-purple-500', hoverBg: 'hover:bg-purple-500/30' },
      orange: { bg: 'bg-orange-500/20', text: 'text-orange-500', hoverBg: 'hover:bg-orange-500/30' },
      cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-500', hoverBg: 'hover:bg-cyan-500/30' },
      pink: { bg: 'bg-pink-500/20', text: 'text-pink-500', hoverBg: 'hover:bg-pink-500/30' },
      yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', hoverBg: 'hover:bg-yellow-500/30' },
      amber: { bg: 'bg-amber-500/20', text: 'text-amber-500', hoverBg: 'hover:bg-amber-500/30' },
      red: { bg: 'bg-red-500/20', text: 'text-red-500', hoverBg: 'hover:bg-red-500/30' },
      indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-500', hoverBg: 'hover:bg-indigo-500/30' },
      teal: { bg: 'bg-teal-500/20', text: 'text-teal-500', hoverBg: 'hover:bg-teal-500/30' },
      violet: { bg: 'bg-violet-500/20', text: 'text-violet-500', hoverBg: 'hover:bg-violet-500/30' }
    };
    return colors[color] || colors.blue;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-gray-900 dark:text-white text-xl font-bold">
              NextGen<span className="text-blue-500">HMS</span>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="hidden md:flex items-center space-x-8">
              <a 
                href="/rooms" 
                className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm flex items-center gap-1"
              >
                <BedDouble className="w-4 h-4" />
                Rooms
              </a>
              <button 
                onClick={() => setShowGuidelines(true)}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm flex items-center gap-1"
              >
                <BookOpen className="w-4 h-4" />
                Guidelines
              </button>
              <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Features</a>
              <a href="#about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">About</a>
              <a href="#contact" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
               {user ? (
                <>
                  <span className="text-gray-600 dark:text-gray-400 text-sm hidden sm:block">
                    Hi, <span className="text-blue-500 dark:text-blue-400">{user.name}</span>
                  </span>
                  <a 
                    href="/profile" 
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
                  >
                    Profile
                  </a>
                  <a 
                    href={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'} 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Dashboard
                  </a>
                  <button 
                    onClick={handleLogout} 
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a 
                    href="/login" 
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
                  >
                    Login
                  </a>
                  <a 
                    href="/login" 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Get Started
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
            <div className="px-4 py-4 space-y-3">
              <a href="/rooms" className="block text-gray-600 dark:text-gray-400 hover:text-blue-500 py-2">Rooms</a>
              <button onClick={() => setShowGuidelines(true)} className="block text-gray-600 dark:text-gray-400 hover:text-blue-500 py-2 w-full text-left">Guidelines</button>
              <a href="#features" className="block text-gray-600 dark:text-gray-400 hover:text-blue-500 py-2">Features</a>
              <a href="#about" className="block text-gray-600 dark:text-gray-400 hover:text-blue-500 py-2">About</a>
              <a href="#contact" className="block text-gray-600 dark:text-gray-400 hover:text-blue-500 py-2">Contact</a>
              <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                <ThemeToggle />
              </div>
              {user ? (
                <div className="space-y-2 pt-2">
                  <span className="block text-gray-600 dark:text-gray-400">Hi, {user.name}</span>
                  <a href="/profile" className="block text-blue-500 py-2">Profile</a>
                  <a href={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'} className="block text-blue-500 py-2">Dashboard</a>
                  <button onClick={handleLogout} className="block text-red-500 py-2 w-full text-left">Logout</button>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <a href="/login" className="block text-gray-600 dark:text-gray-400 py-2">Login</a>
                  <a href="/login" className="block bg-blue-600 text-white px-4 py-2 rounded-lg text-center">Get Started</a>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            {/* Left Content */}
            <div className="space-y-3 sm:space-y-4 text-center lg:text-left order-2 lg:order-1">
              <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <span className="text-blue-500 dark:text-blue-400 text-xs font-medium">Luxury Hotel Management</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                The Future of<br/>
                <span className="text-blue-500">Hotel Management</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-lg">
                Experience seamless hospitality operations with our AI-powered platform. 
                Built for modern hotels, designed for better guest experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a 
                  href="/login" 
                  className="px-5 py-2.5 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center"
                >
                  Start Free Trial
                </a>
                <button 
                  onClick={() => setShowGuidelines(true)}
                  className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  View Guidelines
                </button>
              </div>
              {/* Stats */}
              <div className="flex gap-4 sm:gap-6 lg:gap-8 pt-4 sm:pt-6 justify-center lg:justify-start">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">500+</div>
                  <div className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm">Hotels</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">10K+</div>
                  <div className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm">Rooms</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">1M+</div>
                  <div className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm">Guests</div>
                </div>
              </div>
            </div>

            {/* Right Content - Spline Animation */}
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-3xl"></div>
              <div className="relative bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl h-[350px] sm:h-[400px] md:h-[450px] w-full overflow-hidden flex items-center justify-center">
                <iframe 
                  src="https://my.spline.design/circularparticleanimation-aujyrW7HyuULg05xMUEfmkgB?hideUI=1" 
                  frameBorder="0" 
                  width="120%" 
                  height="120%"
                  title="Spline Animation"
                  loading="lazy"
                  style={{ transform: 'scale(1.5)', transformOrigin: 'center center' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100/50 dark:bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Powerful Features</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to manage your hotel efficiently
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature Card 1 */}
            <div className="p-6 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-gray-300 dark:hover:border-slate-600 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Concierge</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Smart AI assistant helps guests with bookings, recommendations, and 24/7 support.</p>
            </div>
            {/* Feature Card 2 */}
            <div className="p-6 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-gray-300 dark:hover:border-slate-600 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Guest Management</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Comprehensive guest profiles, booking management, and communication tools in one place.</p>
            </div>
            {/* Feature Card 3 */}
            <div className="p-6 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-gray-300 dark:hover:border-slate-600 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Real-time Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Live dashboards and reports to track hotel performance, room occupancy, and guest satisfaction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Why Choose NextGen HMS?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Our platform combines cutting-edge technology with intuitive design to deliver 
                a seamless hotel management experience.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Cloud-based solution with 99.9% uptime guarantee</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">HIPAA compliant with end-to-end encryption</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">24/7 customer support and training</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-gray-100/50 dark:bg-slate-700/50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-500 dark:text-blue-400">98%</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">Customer Satisfaction</div>
                </div>
                <div className="text-center p-4 bg-gray-100/50 dark:bg-slate-700/50 rounded-lg">
                  <div className="text-3xl font-bold text-emerald-500 dark:text-emerald-400">50%</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">Time Saved</div>
                </div>
                <div className="text-center p-4 bg-gray-100/50 dark:bg-slate-700/50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-500 dark:text-purple-400">40%</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">Cost Reduction</div>
                </div>
                <div className="text-center p-4 bg-gray-100/50 dark:bg-slate-700/50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-500 dark:text-orange-400">24/7</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">Support Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100/50 dark:bg-slate-800/30">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Join hundreds of hotels already using NextGen HMS to transform their operations.
          </p>
          <a 
            href="/login" 
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Start Your Free Trial
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-gray-900 dark:text-white font-bold">
            NextGen<span className="text-blue-500">HMS</span>
          </div>
          <div className="text-gray-500 dark:text-gray-500 text-sm">
            © 2024 NextGen HMS. All rights reserved.
          </div>
        </div>
      </footer>

      {/* AI Concierge Widget */}
      <AIConcierge />

      {/* Guidelines Modal */}
      <AnimatePresence>
        {showGuidelines && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowGuidelines(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Platform Guidelines</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">All features and functionalities</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGuidelines(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid md:grid-cols-2 gap-4">
                  {features.map((feature, index) => {
                    const colorClasses = getColorClasses(feature.color);
                    return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClasses.bg} ${colorClasses.hoverBg} transition-colors`}>
                          <feature.icon className={`w-5 h-5 ${colorClasses.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{feature.description}</p>
                          <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                            <span className="font-medium">Use Effect:</span> {feature.useEffect}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <CurrencyProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage onLogin={setUser} />} />
          <Route path="/register" element={<RegisterPage onRegister={setUser} />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:id" element={<RoomDetailPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin-dashboard" element={
            <ProtectedRoute adminOnly>
              <AdminAnalytics />
            </ProtectedRoute>
          } />
          
          <Route path="/admin-requests" element={
            <ProtectedRoute adminOnly>
              <AdminRequests />
            </ProtectedRoute>
          } />
          
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Router>
    </CurrencyProvider>
  );
}

export default App;
