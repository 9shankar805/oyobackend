import React, { useState, useEffect } from 'react'

interface Content {
  id: string
  type: 'banner' | 'promotion' | 'policy' | 'faq'
  title: string
  content: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export const ContentManagement: React.FC = () => {
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [editingContent, setEditingContent] = useState<Content | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadContents()
  }, [])

  const loadContents = async () => {
    setLoading(true)
    try {
      // Mock data
      const mockContents: Content[] = [
        {
          id: '1',
          type: 'banner',
          title: 'Welcome Banner',
          content: 'Book your perfect stay with OYO',
          status: 'active',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          type: 'promotion',
          title: 'New Year Offer',
          content: 'Get 30% off on all bookings',
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]
      setContents(mockContents)
    } catch (error) {
      console.error('Error loading contents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (contentData: Partial<Content>) => {
    try {
      if (editingContent) {
        // Update existing content
        setContents(prev => 
          prev.map(content => 
            content.id === editingContent.id 
              ? { ...content, ...contentData, updatedAt: new Date().toISOString() }
              : content
          )
        )
      } else {
        // Create new content
        const newContent: Content = {
          id: Date.now().toString(),
          type: contentData.type || 'banner',
          title: contentData.title || '',
          content: contentData.content || '',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setContents(prev => [...prev, newContent])
      }
      setShowForm(false)
      setEditingContent(null)
    } catch (error) {
      console.error('Error saving content:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      setContents(prev => prev.filter(content => content.id !== id))
    }
  }

  const toggleStatus = async (id: string) => {
    setContents(prev => 
      prev.map(content => 
        content.id === id 
          ? { 
              ...content, 
              status: content.status === 'active' ? 'inactive' : 'active',
              updatedAt: new Date().toISOString()
            }
          : content
      )
    )
  }

  const getTypeColor = (type: Content['type']) => {
    switch (type) {
      case 'banner': return 'bg-blue-100 text-blue-800'
      case 'promotion': return 'bg-green-100 text-green-800'
      case 'policy': return 'bg-purple-100 text-purple-800'
      case 'faq': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading content...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Content Management</h2>
        <button
          onClick={() => {
            setEditingContent(null)
            setShowForm(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Content
        </button>
      </div>

      {/* Content Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingContent ? 'Edit Content' : 'Add New Content'}
          </h3>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            handleSave({
              type: formData.get('type') as Content['type'],
              title: formData.get('title') as string,
              content: formData.get('content') as string
            })
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  name="type"
                  defaultValue={editingContent?.type || 'banner'}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="banner">Banner</option>
                  <option value="promotion">Promotion</option>
                  <option value="policy">Policy</option>
                  <option value="faq">FAQ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingContent?.title || ''}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                name="content"
                defaultValue={editingContent?.content || ''}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingContent(null)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Content</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Updated</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contents.map((content) => (
                <tr key={content.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(content.type)}`}>
                      {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{content.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{content.content}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(content.id)}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        content.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(content.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingContent(content)
                          setShowForm(true)
                        }}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(content.id)}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {contents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No content available. Create your first content item.
        </div>
      )}
    </div>
  )
}