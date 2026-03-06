import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, MapPin, Camera, Save, Check, AlertCircle, Building, FileText, Shield } from 'lucide-react'

type ProfileStep = 'basic' | 'business' | 'verification' | 'complete'

export default function OwnerProfile() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<ProfileStep>('basic')
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    avatar: null,
    businessName: '',
    businessType: '',
    businessAddress: '',
    panNumber: '',
    gstNumber: '',
    bankAccount: '',
    ifscCode: ''
  })

  const updateProfile = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const completionPercentage = {
    basic: 25,
    business: 50,
    verification: 75,
    complete: 100
  }

  const steps = [
    { id: 'basic', title: 'Basic Info', icon: User, completed: false },
    { id: 'business', title: 'Business', icon: Building, completed: false },
    { id: 'verification', title: 'Verification', icon: Shield, completed: false },
    { id: 'complete', title: 'Complete', icon: Check, completed: false }
  ]

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Saving profile:', profile)
      
      // Move to next step
      const stepOrder: ProfileStep[] = ['basic', 'business', 'verification', 'complete']
      const currentIndex = stepOrder.indexOf(currentStep)
      if (currentIndex < stepOrder.length - 1) {
        setCurrentStep(stepOrder[currentIndex + 1])
      } else {
        navigate('/owner')
      }
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const ProgressIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = step.id === currentStep
          const isCompleted = steps.findIndex(s => s.id === currentStep) > index
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                isActive ? 'border-red-600 bg-red-600 text-white' : 
                isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                'border-gray-300 bg-white text-gray-500'
              }`}>
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-medium ${isActive ? 'text-red-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`hidden sm:block w-full h-0.5 mx-4 ${
                  steps.findIndex(s => s.id === currentStep) > index ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          )
        })}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-red-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${completionPercentage[currentStep]}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mt-2">Profile Completion: {completionPercentage[currentStep]}%</p>
    </div>
  )

  const BasicInfoStep = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6 mb-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-12 w-12 text-gray-400" />
          </div>
          <button className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Complete Your Profile</h2>
          <p className="text-gray-600">Add your basic information to get started</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => updateProfile('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => updateProfile('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter email address"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => updateProfile('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input
            type="text"
            value={profile.address}
            onChange={(e) => updateProfile('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter your address"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
        <textarea
          value={profile.bio}
          onChange={(e) => updateProfile('bio', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Tell us about yourself and your experience in hospitality"
        />
      </div>
    </div>
  )

  const BusinessInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Building className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
        <p className="text-gray-600">Add your business details to verify your account</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
          <input
            type="text"
            value={profile.businessName}
            onChange={(e) => updateProfile('businessName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter business name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
          <select
            value={profile.businessType}
            onChange={(e) => updateProfile('businessType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Select business type</option>
            <option value="individual">Individual Proprietor</option>
            <option value="partnership">Partnership Firm</option>
            <option value="company">Private Limited Company</option>
            <option value="llp">Limited Liability Partnership</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
        <input
          type="text"
          value={profile.businessAddress}
          onChange={(e) => updateProfile('businessAddress', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Enter business address"
        />
      </div>
    </div>
  )

  const VerificationStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Verification Details</h2>
        <p className="text-gray-600">Add your verification documents for secure transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
          <input
            type="text"
            value={profile.panNumber}
            onChange={(e) => updateProfile('panNumber', e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent uppercase"
            placeholder="Enter PAN number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">GST Number (Optional)</label>
          <input
            type="text"
            value={profile.gstNumber}
            onChange={(e) => updateProfile('gstNumber', e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent uppercase"
            placeholder="Enter GST number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
          <input
            type="text"
            value={profile.bankAccount}
            onChange={(e) => updateProfile('bankAccount', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter bank account number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
          <input
            type="text"
            value={profile.ifscCode}
            onChange={(e) => updateProfile('ifscCode', e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent uppercase"
            placeholder="Enter IFSC code"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Document Verification</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your documents will be securely verified within 2-3 business days. We'll notify you once verification is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const CompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Complete!</h2>
        <p className="text-gray-600">Your profile has been successfully set up. You can now start managing your properties.</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
        <div className="space-y-3 text-left">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-gray-700">Add your first hotel property</span>
          </div>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-gray-700">Set room types and pricing</span>
          </div>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-gray-700">Upload property photos</span>
          </div>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-gray-700">Start receiving bookings</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/owner/hotels')}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
        >
          Add Your First Hotel
        </button>
        <button
          onClick={() => navigate('/owner')}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 'basic': return <BasicInfoStep />
      case 'business': return <BusinessInfoStep />
      case 'verification': return <VerificationStep />
      case 'complete': return <CompleteStep />
      default: return <BasicInfoStep />
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-8">
          <ProgressIndicator />
          
          {currentStep !== 'complete' && (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              {renderStep()}
              
              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save & Continue
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
          
          {currentStep === 'complete' && renderStep()}
        </div>
      </div>
    </div>
  )
}