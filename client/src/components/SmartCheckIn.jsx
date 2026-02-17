import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, ShieldCheck, User, AlertCircle } from 'lucide-react';

export default function SmartCheckIn() {
  const [isScanning, setIsScanning] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const [guestData, setGuestData] = useState(null);

  const startScan = () => {
    setIsScanning(true);
    setError(false);
    
    // Simulate ID verification process
    setTimeout(() => {
      setIsScanning(false);
      
      // Simulate successful verification (90% success rate for demo)
      if (Math.random() > 0.1) {
        setVerified(true);
        setGuestData({
          name: 'John Doe',
          id: 'GST-2024-001',
          membership: 'Gold',
          roomPreference: 'King Bed',
          specialRequests: ['Late Checkout']
        });
      } else {
        setError(true);
      }
    }, 3000);
  };

  const resetScan = () => {
    setIsScanning(false);
    setVerified(false);
    setError(false);
    setGuestData(null);
  };

  return (
    <div className="p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl max-w-md mx-auto text-center">
      <h3 className="text-xl font-bold mb-2 text-white">Digital Identity Verification</h3>
      <p className="text-gray-400 text-sm mb-6">Secure check-in with biometric verification</p>
      
      {/* Scanner Area */}
      <div className="relative w-48 h-64 bg-slate-800 mx-auto rounded-xl overflow-hidden mb-6 border-2 border-dashed border-blue-500/50">
        {/* Scanning Animation */}
        <AnimatePresence>
          {isScanning && (
            <motion.div 
              initial={{ top: '0%' }}
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"
            />
          )}
        </AnimatePresence>
        
        {/* Corner Markers */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-blue-400"></div>
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-blue-400"></div>
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-blue-400"></div>
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-blue-400"></div>
        
        {/* Status Display */}
        <div className="flex flex-col items-center justify-center h-full">
          {verified ? (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center text-emerald-400"
            >
              <ShieldCheck size={48} />
              <span className="mt-2 text-sm font-bold uppercase">Verified</span>
            </motion.div>
          ) : error ? (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center text-red-400"
            >
              <AlertCircle size={48} />
              <span className="mt-2 text-sm font-bold uppercase">Error</span>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center text-slate-500">
              <User size={48} className={isScanning ? "animate-pulse text-blue-400" : ""} />
              <span className="mt-2 text-xs">
                {isScanning ? "Processing..." : "Position ID in frame"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Guest Data Display */}
      <AnimatePresence>
        {verified && guestData && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-left"
          >
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Name</span>
                <p className="text-white font-medium">{guestData.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Guest ID</span>
                <p className="text-white font-medium">{guestData.id}</p>
              </div>
              <div>
                <span className="text-gray-500">Membership</span>
                <p className="text-white font-medium">{guestData.membership}</p>
              </div>
              <div>
                <span className="text-gray-500">Room Preference</span>
                <p className="text-white font-medium">{guestData.roomPreference}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Special Requests</span>
                <div className="flex gap-2 mt-1">
                  {guestData.specialRequests.map((request, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                      {request}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <p className="text-red-400 text-sm">
              Unable to verify identity. Please try again or contact reception.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      <button 
        onClick={verified || error ? resetScan : startScan}
        disabled={isScanning}
        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
          verified 
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
            : error
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
              : isScanning
                ? 'bg-blue-500/50 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
        }`}
      >
        {isScanning ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Scan className="w-5 h-5" />
            </motion.span>
            Processing ID...
          </span>
        ) : verified ? (
          'Proceed to Check-in'
        ) : error ? (
          'Try Again'
        ) : (
          'Scan ID to Check-in'
        )}
      </button>

      {/* Security Note */}
      <p className="mt-4 text-xs text-gray-500 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" />
        Your data is encrypted and secure
      </p>
    </div>
  );
}
