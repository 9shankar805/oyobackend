import React, { useState } from 'react'
import { Upload, Trash2, Eye, Plus } from 'lucide-react'

const mockImages = [
  { id: '1', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', title: 'Hotel Exterior', category: 'exterior' },
  { id: '2', url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', title: 'Deluxe Room', category: 'rooms' },
  { id: '3', url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400', title: 'Lobby', category: 'common' },
  { id: '4', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', title: 'Restaurant', category: 'amenities' }
]

export default function OwnerGallery() {
  const [images, setImages] = useState(mockImages)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)

  const categories = [
    { key: 'all', label: 'All Images' },
    { key: 'exterior', label: 'Exterior' },
    { key: 'rooms', label: 'Rooms' },
    { key: 'common', label: 'Common Areas' },
    { key: 'amenities', label: 'Amenities' }
  ]

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory)

  const handleDeleteImage = (id: string) => {
    setImages(images.filter(img => img.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Images
        </button>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.key
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredImages.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
            <div className="relative">
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                  <button className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteImage(image.id)}
                    className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-gray-900 text-sm">{image.title}</h3>
              <p className="text-xs text-gray-500 capitalize">{image.category}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Upload Images</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Drag and drop images here</p>
              <p className="text-sm text-gray-500 mb-4">or click to browse</p>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Choose Files
              </button>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}