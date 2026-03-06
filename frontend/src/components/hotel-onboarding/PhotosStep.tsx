import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Upload, 
  X, 
  Check, 
  AlertCircle,
  Image as ImageIcon,
  Star,
  Eye,
  Download,
  RefreshCw,
  Zap,
  Shield
} from 'lucide-react';

interface Photo {
  id: string;
  file: File;
  url: string;
  category: string;
  size: number;
  quality: number;
  issues: string[];
  status: 'uploading' | 'processing' | 'approved' | 'rejected';
}

interface PhotosStepProps {
  data: any;
  updateData: (data: any) => void;
  validateStep: (isValid: boolean) => void;
}

const PhotosStep: React.FC<PhotosStepProps> = ({ data, updateData, validateStep }) => {
  const [photos, setPhotos] = useState<Photo[]>(data.photos || {
    exterior: [],
    lobby: [],
    rooms: [],
    amenities: [],
    dining: [],
    surroundings: []
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('exterior');

  const photoCategories = [
    {
      key: 'exterior',
      label: 'Exterior',
      description: 'Building from outside, entrance, signage',
      minRequired: 3,
      maxPhotos: 10,
      icon: Building
    },
    {
      key: 'lobby',
      label: 'Lobby & Reception',
      description: 'Front desk, waiting area, common spaces',
      minRequired: 2,
      maxPhotos: 8,
      icon: Users
    },
    {
      key: 'rooms',
      label: 'Room Interiors',
      description: 'Different room types, bedrooms, bathrooms',
      minRequired: 4,
      maxPhotos: 15,
      icon: Bed
    },
    {
      key: 'amenities',
      label: 'Amenities',
      description: 'Pool, gym, restaurant, facilities',
      minRequired: 3,
      maxPhotos: 10,
      icon: Coffee
    },
    {
      key: 'dining',
      label: 'Dining Areas',
      description: 'Restaurant, breakfast area, bar',
      minRequired: 2,
      maxPhotos: 6,
      icon: Utensils
    },
    {
      key: 'surroundings',
      label: 'Surroundings',
      description: 'Neighborhood, nearby attractions, views',
      minRequired: 2,
      maxPhotos: 8,
      icon: MapPin
    }
  ];

  useEffect(() => {
    validatePhotos();
  }, [photos]);

  const validatePhotos = () => {
    const totalPhotos = Object.values(photos).reduce((total, arr: Photo[]) => total + arr.length, 0);
    const approvedPhotos = Object.values(photos).reduce((total, arr: Photo[]) => 
      total + arr.filter(p => p.status === 'approved').length, 0);

    // Check minimum requirements
    let allCategoriesMet = true;
    const missingCategories: string[] = [];

    photoCategories.forEach(category => {
      const categoryPhotos = photos[category.key] as Photo[];
      const approvedCount = categoryPhotos.filter(p => p.status === 'approved').length;
      
      if (approvedCount < category.minRequired) {
        allCategoriesMet = false;
        missingCategories.push(`${category.label} (${approvedCount}/${category.minRequired})`);
      }
    });

    const isValid = totalPhotos >= 10 && approvedPhotos >= 10 && allCategoriesMet;
    
    updateData({ photos });
    validateStep(isValid);

    return {
      totalPhotos,
      approvedPhotos,
      isValid,
      missingCategories
    };
  };

  const simulateAIAnalysis = (file: File): Promise<{ quality: number; issues: string[]; status: 'approved' | 'rejected' }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate AI quality analysis
        const quality = Math.floor(Math.random() * 40) + 60; // 60-100 quality score
        const issues: string[] = [];

        // Simulate common photo issues
        if (quality < 70) {
          issues.push('Low resolution or blurry image');
        }
        if (Math.random() < 0.1) {
          issues.push('Watermark or logo detected');
        }
        if (Math.random() < 0.15) {
          issues.push('Poor lighting');
        }
        if (Math.random() < 0.1) {
          issues.push('Duplicate photo detected');
        }

        resolve({
          quality,
          issues,
          status: quality >= 75 && issues.length === 0 ? 'approved' : 'rejected'
        });
      }, 2000 + Math.random() * 2000); // 2-4 seconds
    });
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);

    const newPhotos: Photo[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        continue;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        continue;
      }

      // Create photo object
      const photo: Photo = {
        id: `photo_${Date.now()}_${i}`,
        file,
        url: URL.createObjectURL(file),
        category: selectedCategory,
        size: file.size,
        quality: 0,
        issues: [],
        status: 'uploading'
      };

      newPhotos.push(photo);
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress((i * 100 / files.length) + (progress / files.length));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Simulate AI analysis
      photo.status = 'processing';
      setPhotos(prev => ({
        ...prev,
        [selectedCategory]: [...prev[selectedCategory], photo]
      }));

      const analysis = await simulateAIAnalysis(file);
      photo.quality = analysis.quality;
      photo.issues = analysis.issues;
      photo.status = analysis.status;

      setPhotos(prev => ({
        ...prev,
        [selectedCategory]: prev[selectedCategory].map(p => 
          p.id === photo.id ? photo : p
        )
      }));
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  const removePhoto = (category: string, photoId: string) => {
    setPhotos(prev => ({
      ...prev,
      [category]: (prev[category] as Photo[]).filter(p => p.id !== photoId)
    }));
  };

  const getTotalPhotos = () => {
    return Object.values(photos).reduce((total, arr: Photo[]) => total + arr.length, 0);
  };

  const getApprovedPhotos = () => {
    return Object.values(photos).reduce((total, arr: Photo[]) => 
      total + arr.filter(p => p.status === 'approved').length, 0);
  };

  const getPhotosByCategory = (category: string) => {
    return photos[category] as Photo[] || [];
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 85) return 'text-green-600 bg-green-100';
    if (quality >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPhotoRequirements = () => {
    const validation = validatePhotos();
    const categoryRequirements = photoCategories.map(category => {
      const photos = getPhotosByCategory(category.key);
      const approved = photos.filter(p => p.status === 'approved').length;
      
      return {
        ...category,
        current: approved,
        required: category.minRequired,
        met: approved >= category.minRequired
      };
    });

    return categoryRequirements;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-2">Upload Hotel Photos</h3>
        <p className="text-gray-600">
          Upload at least 10 high-quality photos across all categories
        </p>
      </div>

      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Photo Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {photoCategories.map((category) => {
              const IconComponent = category.icon;
              const photos = getPhotosByCategory(category.key);
              const approved = photos.filter(p => p.status === 'approved').length;
              
              return (
                <div
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedCategory === category.key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <IconComponent className={`w-6 h-6 mx-auto mb-2 ${
                      selectedCategory === category.key ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <p className={`text-sm font-medium ${
                      selectedCategory === category.key ? 'text-blue-600' : 'text-gray-700'
                    }`}>{category.label}</p>
                    <Badge 
                      variant="outline" 
                      className={`mt-2 ${
                        approved >= category.minRequired 
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-gray-100 text-gray-800 border-gray-300'
                      }`}
                    >
                      {approved}/{category.minRequired}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-8">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              isUploading ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            
            {isUploading ? (
              <div className="space-y-4">
                <p className="text-lg font-medium text-blue-600">Processing Photos...</p>
                <Progress value={uploadProgress} className="w-64 mx-auto" />
                <p className="text-sm text-gray-600">
                  {uploadProgress.toFixed(0)}% complete
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">Drop photos here or click to browse</p>
                <p className="text-sm text-gray-600 mb-4">
                  Accepted formats: JPG, PNG, WebP (Max 10MB per photo)
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  id="photo-upload"
                />
                <Button asChild>
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Camera className="w-4 h-4 mr-2" />
                    Choose Photos
                  </label>
                </Button>
              </div>
            )}
          </div>

          {/* Selected Category Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">
                  {photoCategories.find(c => c.key === selectedCategory)?.label}
                </p>
                <p className="text-sm text-blue-700">
                  {photoCategories.find(c => c.key === selectedCategory)?.description}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getPhotoRequirements().map((requirement) => (
          <Card 
            key={requirement.key} 
            className={
              requirement.met 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <requirement.icon className="w-5 h-5" />
                  <span className="font-medium">{requirement.label}</span>
                </div>
                {requirement.met ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Required:</span>
                  <span className="font-medium">{requirement.minRequired}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Uploaded:</span>
                  <Badge variant={
                    requirement.current >= requirement.minRequired ? 'default' : 'secondary'
                  }>
                    {requirement.current}
                  </Badge>
                </div>
              </div>

              {/* Photos in this category */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {getPhotosByCategory(requirement.key).slice(0, 4).map((photo) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.url}
                      alt=""
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 w-6 h-6 p-0"
                      onClick={() => removePhoto(requirement.key, photo.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    
                    {/* Quality Badge */}
                    {photo.quality > 0 && (
                      <Badge
                        className={`absolute bottom-1 left-1 text-xs px-1 ${getQualityColor(photo.quality)}`}
                      >
                        {photo.quality}%
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Analysis Info */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Zap className="w-6 h-6 text-purple-600 mt-1" />
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">AI-Powered Photo Analysis</h4>
              <ul className="text-purple-700 space-y-2 text-sm">
                <li>• Automatic quality assessment (resolution, lighting, composition)</li>
                <li>• Content moderation and inappropriate content detection</li>
                <li>• Duplicate photo identification</li>
                <li>• Watermark and logo detection</li>
                <li>• Auto-categorization by room type and amenity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">{getTotalPhotos()}</p>
              <p className="text-gray-600">Total Photos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{getApprovedPhotos()}</p>
              <p className="text-gray-600">Approved Photos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">10+</p>
              <p className="text-gray-600">Minimum Required</p>
            </div>
          </div>
          
          {getApprovedPhotos() >= 10 && (
            <div className="mt-6 text-center">
              <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-green-800">
                Photo requirements met!
              </p>
              <p className="text-sm text-green-700">
                You can proceed to the next step
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Missing icons - add these imports
const Building = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className={className}>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

const Users = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const Bed = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className={className}>
    <path d="M2 3h20v4H2zM4 9h16v10h2v-6h4v6h2V9a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z"/>
  </svg>
);

const Coffee = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className={className}>
    <path d="M18 6h-1V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"/>
  </svg>
);

const Utensils = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className={className}>
    <path d="M3 2v7c0 1.1.9 2 2 2s2-.9 2-2V2h2v16h2V2h2v7c0 1.1.9 2 2 2s2-.9 2-2V2h2v16h2V2z"/>
  </svg>
);

const MapPin = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

export default PhotosStep;