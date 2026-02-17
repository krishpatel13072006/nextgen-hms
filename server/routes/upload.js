import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const router = express.Router();

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return process.env.CLOUDINARY_CLOUD_NAME && 
         process.env.CLOUDINARY_API_KEY && 
         process.env.CLOUDINARY_API_SECRET &&
         !process.env.CLOUDINARY_CLOUD_NAME.includes('your_');
};

// Configure Cloudinary only if properly configured
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary configured successfully');
} else {
  console.log('Cloudinary not configured - using local storage fallback');
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure local storage
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// Configure multer - always use disk storage for reliable fallback
const upload = multer({
  storage: localStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
  },
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = async (buffer, folder = 'nextgen-hms') => {
  try {
    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          transformation: [{ width: 1200, height: 800, crop: 'limit' }],
          quality: 'auto:good',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  } catch (error) {
    throw error;
  }
};

// Single image upload
router.post('/single', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    let result;
    
    // Check if we should use Cloudinary or local storage
    // If Cloudinary is not properly configured or fails, use local storage
    const useCloudinary = isCloudinaryConfigured();
    
    if (useCloudinary) {
      try {
        // Read file from disk and upload to Cloudinary
        const fileBuffer = fs.readFileSync(req.file.path);
        const cloudResult = await uploadToCloudinary(fileBuffer);
        result = {
          url: cloudResult.secure_url,
          public_id: cloudResult.public_id,
          width: cloudResult.width,
          height: cloudResult.height,
          format: cloudResult.format,
        };
      } catch (cloudError) {
        console.warn('Cloudinary upload failed, falling back to local storage:', cloudError.message);
        // Fall through to local storage
      }
    }
    
    // If Cloudinary failed or not configured, use local storage
    if (!result) {
      const baseUrl = `http://localhost:${process.env.PORT || 5000}`;
      result = {
        url: `${baseUrl}/uploads/${req.file.filename}`,
        public_id: req.file.filename,
        width: 800,
        height: 600,
        format: path.extname(req.file.originalname).slice(1),
      };
    }

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      image: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message,
    });
  }
});

// Multiple images upload (up to 5)
router.post('/multiple', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    let images;
    
    // Check if we should use Cloudinary or local storage
    const useCloudinary = isCloudinaryConfigured();
    
    if (useCloudinary) {
      try {
        // Read files from disk and upload to Cloudinary
        const uploadPromises = req.files.map((file) => {
          const fileBuffer = fs.readFileSync(file.path);
          return uploadToCloudinary(fileBuffer);
        });
        const results = await Promise.all(uploadPromises);
        
        images = results.map((result) => ({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        }));
      } catch (cloudError) {
        console.warn('Cloudinary upload failed, falling back to local storage:', cloudError.message);
        // Fall through to local storage
      }
    }
    
    // If Cloudinary failed or not configured, use local storage
    if (!images) {
      const baseUrl = `http://localhost:${process.env.PORT || 5000}`;
      images = req.files.map((file) => ({
        url: `${baseUrl}/uploads/${file.filename}`,
        public_id: file.filename,
        width: 800,
        height: 600,
        format: path.extname(file.originalname).slice(1),
      }));
    }

    res.json({
      success: true,
      message: `${images.length} images uploaded successfully`,
      images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message,
    });
  }
});

// Delete image
router.delete('/:public_id', async (req, res) => {
  try {
    const { public_id } = req.params;
    
    if (isCloudinaryConfigured()) {
      const result = await cloudinary.uploader.destroy(public_id);
      
      if (result.result === 'ok') {
        res.json({
          success: true,
          message: 'Image deleted successfully',
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Image not found',
        });
      }
    } else {
      // Delete local file
      const filePath = path.join(uploadsDir, public_id);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({
          success: true,
          message: 'Image deleted successfully',
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Image not found',
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message,
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 files.',
      });
    }
  }
  
  res.status(400).json({
    success: false,
    message: error.message || 'Upload error',
  });
});

export default router;
