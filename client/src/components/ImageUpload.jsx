import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function ImageUpload({ 
  onUploadComplete, 
  multiple = false, 
  maxFiles = 5,
  currentImages = [],
  onRemoveImage 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedImages, setUploadedImages] = useState(currentImages);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    // Filter only image files
    const imageFiles = files.filter(file => 
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
    );

    if (imageFiles.length === 0) {
      setError('Please select valid image files (JPEG, PNG, GIF, or WebP)');
      return;
    }

    if (!multiple && imageFiles.length > 1) {
      setError('Only one image is allowed');
      return;
    }

    if (multiple && imageFiles.length + uploadedImages.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (multiple) {
        // Upload multiple images
        const formData = new FormData();
        imageFiles.forEach(file => {
          formData.append('images', file);
        });

        const { data } = await axios.post('http://localhost:5000/api/upload/multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });

        const newImages = [...uploadedImages, ...data.images];
        setUploadedImages(newImages);
        onUploadComplete?.(newImages);
      } else {
        // Upload single image
        const formData = new FormData();
        formData.append('image', imageFiles[0]);

        const { data } = await axios.post('http://localhost:5000/api/upload/single', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });

        setUploadedImages([data.image]);
        onUploadComplete?.(data.image);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading image(s)');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (publicId, index) => {
    try {
      await axios.delete(`http://localhost:5000/api/upload/${encodeURIComponent(publicId)}`);
      const newImages = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(newImages);
      onRemoveImage?.(publicId, index);
      onUploadComplete?.(multiple ? newImages : null);
    } catch (err) {
      console.error('Error removing image:', err);
    }
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
          ${isDragging 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
          }
          ${isUploading ? 'pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-gray-400">Uploading... {uploadProgress}%</p>
            <div className="w-full max-w-xs h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                className="h-full bg-blue-500"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-slate-700 rounded-xl">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-white font-medium">
                Drop {multiple ? 'images' : 'an image'} here or click to upload
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {multiple ? `Up to ${maxFiles} images, ` : ''}Max 5MB each (JPEG, PNG, GIF, WebP)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {uploadedImages.map((image, index) => (
            <motion.div
              key={image.public_id || index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative group aspect-square rounded-xl overflow-hidden bg-slate-800"
            >
              <img
                src={image.url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(image.public_id, index);
                  }}
                  className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Success Badge */}
              <div className="absolute top-2 right-2 p-1 bg-emerald-500 rounded-full">
                <Check className="w-3 h-3 text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
