import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const PhotoUpload = ({
  label = 'Upload Photos',
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
  },
  className = '',
  required = false
}) => {
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    setError('');

    // Handle rejected files
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Only image files are allowed');
      } else {
        setError('File upload failed');
      }
      return;
    }

    // Check total file count
    if (value.length + acceptedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} photos allowed`);
      return;
    }

    // Process accepted files
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const newPhoto = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          data: reader.result,
          uploadedAt: new Date().toISOString()
        };
        onChange([...value, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  }, [value, onChange, maxFiles, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: true,
    disabled: value.length >= maxFiles
  });

  const removePhoto = (photoId) => {
    onChange(value.filter(photo => photo.id !== photoId));
    setError('');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : value.length >= maxFiles
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-primary hover:bg-primary/5'
          }
          ${error ? 'border-error bg-error/5' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-2">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
            <ApperIcon 
              name={isDragActive ? "Upload" : "Camera"} 
              className={`w-6 h-6 ${isDragActive ? 'text-primary' : 'text-gray-500'}`} 
            />
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-900">
              {isDragActive
                ? 'Drop images here...'
                : value.length >= maxFiles
                  ? 'Maximum photos reached'
                  : 'Drag & drop images or click to browse'
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF up to {Math.round(maxSize / (1024 * 1024))}MB ({maxFiles - value.length} remaining)
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-error flex items-center gap-1">
          <ApperIcon name="AlertCircle" className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* Photo Previews */}
      <AnimatePresence>
        {value.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {value.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group card overflow-hidden"
              >
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={photo.data}
                    alt={photo.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                  />
                </div>
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePhoto(photo.id)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-xs font-medium truncate">{photo.name}</p>
                  <p className="text-white/80 text-xs">{formatFileSize(photo.size)}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoUpload;