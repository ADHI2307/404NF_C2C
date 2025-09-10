import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Camera, Upload, X, Eye, Trash2, AlertCircle } from 'lucide-react';

export default function ImageUpload({ onImagesChange, maxImages = 3 }) {
  const [images, setImages] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image size must be less than 10MB');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newImages = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      type: 'upload'
    }));

    const updatedImages = [...images, ...newImages].slice(0, maxImages);
    setImages(updatedImages);
    onImagesChange(updatedImages);
    setError(null);
  };

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setIsCapturing(true);
    } catch (err) {
      setError('Camera access denied or not available. Please check your camera permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });

        const newImage = {
          id: Date.now() + Math.random(),
          file,
          preview: URL.createObjectURL(blob),
          type: 'camera'
        };

        const updatedImages = [...images, newImage].slice(0, maxImages);
        setImages(updatedImages);
        onImagesChange(updatedImages);
        setError(null);
      }
    }, 'image/jpeg', 0.8);

    stopCamera();
  };

  const removeImage = (imageId) => {
    const updatedImages = images.filter(img => {
      if (img.id === imageId) {
        URL.revokeObjectURL(img.preview);
        return false;
      }
      return true;
    });
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getImageTypeLabel = (type) => {
    return type === 'camera' ? 'Camera' : 'Upload';
  };

  const getImageTypeColor = (type) => {
    return type === 'camera' ? 'bg-green-500' : 'bg-blue-500';
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Camera className="h-5 w-5" />
            Visual Symptom Analysis
          </CardTitle>
          <p className="text-sm text-blue-700">
            Upload photos or take pictures to help analyze visible symptoms, rashes, or external conditions
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload/Camera Controls */}
          <div className="flex gap-3">
            <Button
              onClick={openFileDialog}
              variant="outline"
              className="flex items-center gap-2 hover:bg-blue-50"
            >
              <Upload className="h-4 w-4" />
              Upload Photos
            </Button>
            <Button
              onClick={isCapturing ? stopCamera : startCamera}
              variant="outline"
              className={`flex items-center gap-2 ${
                isCapturing ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'hover:bg-green-50'
              }`}
            >
              <Camera className="h-4 w-4" />
              {isCapturing ? 'Stop Camera' : 'Take Photo'}
            </Button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Camera preview */}
          {isCapturing && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover rounded-lg border border-blue-200"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <Button
                  onClick={capturePhoto}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="bg-white/90 hover:bg-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Image previews */}
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-blue-900">
                  Uploaded Images ({images.length}/{maxImages})
                </h4>
                {images.length >= maxImages && (
                  <Badge variant="warning" className="text-xs">
                    Maximum {maxImages} images
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-blue-200 bg-gray-50">
                      <img
                        src={image.preview}
                        alt="Symptom preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Image info overlay */}
                    <div className="absolute top-2 left-2">
                      <Badge className={`${getImageTypeColor(image.type)} text-white text-xs`}>
                        {getImageTypeLabel(image.type)}
                      </Badge>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                          onClick={() => window.open(image.preview, '_blank')}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-red-50 text-red-600"
                          onClick={() => removeImage(image.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📸 Photo Guidelines:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Take clear, well-lit photos of visible symptoms</li>
              <li>• Include affected areas (skin, eyes, mouth, etc.)</li>
              <li>• Ensure good focus and minimal blur</li>
              <li>• Maximum {maxImages} images, 10MB each</li>
            </ul>
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              <strong>Note:</strong> Photos are optional. You can submit symptoms without images for text-based analysis, or add photos for enhanced visual analysis.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
