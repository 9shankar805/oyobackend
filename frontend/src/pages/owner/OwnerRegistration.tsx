import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../auth/AuthProvider'
import { User, Mail, Phone, MapPin, Building, FileText, Shield, Check } from 'lucide-react'

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  businessName: string
  businessType: string
  address: string
  city: string
  state: string
  pincode: string
  panNumber: string
  gstNumber: string
  bankAccount: string
  ifscCode: string
  agreeTerms: boolean
}

export default function OwnerRegistration() {
  const navigate = useNavigate()
  const { googleLogin } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>()
  const [googleBtnRef, setGoogleBtnRef] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
    const g = (window as any).google
    if (!clientId || !g?.accounts?.id || !googleBtnRef) return

    g.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp: { credential: string }) => {
        try {
          setIsLoading(true)
          await googleLogin(resp.credential, 'owner')
          navigate('/owner/profile-completion')
        } catch (error) {
          console.error('Google registration failed:', error)
        } finally {
          setIsLoading(false)
        }
      },
    })

    g.accounts.id.renderButton(googleBtnRef, {
      theme: 'outline',
      size: 'large',
      width: 360,
      text: 'signup_with'
    })
  }, [navigate, googleLogin, googleBtnRef])

  const steps = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Business Details', icon: Building },
    { id: 3, title: 'Verification', icon: Shield },
    { id: 4, title: 'Bank Details', icon: FileText }
  ]

  const businessTypes = [
    'Individual Proprietor',
    'Partnership Firm',
    'Private Limited Company',
    'Limited Liability Partnership'
  ]

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Registration data:', data)
      navigate('/owner/profile-completion')
    } catch (error) {
      console.error('Registration failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = step.id === currentStep
        const isCompleted = step.id < currentStep
        
        return (
          <div key={step.id} className="flex items-center">
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
              <div className={`hidden sm:block w-16 h-0.5 mx-4 ${
                step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )

  const PersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              {...register('firstName', { required: 'First name is required' })}
              type="text"
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter first name"
            />
          </div>
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            {...register('lastName', { required: 'Last name is required' })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter last name"
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              {...register('phone', { 
                required: 'Phone number is required',
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: 'Invalid phone number'
                }
              })}
              type="tel"
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter 10-digit phone number"
            />
          </div>
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>
      </div>
    </div>
  )

  const BusinessDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
        <div className="relative">
          <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            {...register('businessName', { required: 'Business name is required' })}
            type="text"
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter business name"
          />
        </div>
        {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
        <select
          {...register('businessType', { required: 'Business type is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">Select business type</option>
          {businessTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType.message}</p>}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              {...register('address', { required: 'Address is required' })}
              type="text"
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter complete address"
            />
          </div>
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              {...register('city', { required: 'City is required' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="City"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
          </div>

          <div>
            <input
              {...register('state', { required: 'State is required' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="State"
            />
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
          </div>

          <div>
            <input
              {...register('pincode', { 
                required: 'Pincode is required',
                pattern: {
                  value: /^\d{6}$/,
                  message: 'Invalid pincode'
                }
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Pincode"
            />
            {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode.message}</p>}
          </div>
        </div>
      </div>
    </div>
  )

  const VerificationStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
        <input
          {...register('panNumber', { 
            required: 'PAN number is required',
            pattern: {
              value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
              message: 'Invalid PAN number format'
            }
          })}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent uppercase"
          placeholder="Enter PAN number (e.g., ABCDE1234F)"
        />
        {errors.panNumber && <p className="text-red-500 text-sm mt-1">{errors.panNumber.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">GST Number (Optional)</label>
        <input
          {...register('gstNumber', {
            pattern: {
              value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
              message: 'Invalid GST number format'
            }
          })}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent uppercase"
          placeholder="Enter GST number"
        />
        {errors.gstNumber && <p className="text-red-500 text-sm mt-1">{errors.gstNumber.message}</p>}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Verification Required</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your documents will be verified within 2-3 business days. You'll receive an email once verification is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const BankDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
        <input
          {...register('bankAccount', { 
            required: 'Bank account number is required',
            pattern: {
              value: /^\d{9,18}$/,
              message: 'Invalid account number'
            }
          })}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Enter bank account number"
        />
        {errors.bankAccount && <p className="text-red-500 text-sm mt-1">{errors.bankAccount.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
        <input
          {...register('ifscCode', { 
            required: 'IFSC code is required',
            pattern: {
              value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
              message: 'Invalid IFSC code format'
            }
          })}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent uppercase"
          placeholder="Enter IFSC code (e.g., HDFC0001234)"
        />
        {errors.ifscCode && <p className="text-red-500 text-sm mt-1">{errors.ifscCode.message}</p>}
      </div>

      <div>
        <label className="flex items-start">
          <input
            {...register('agreeTerms', { required: 'You must agree to the terms' })}
            type="checkbox"
            className="mt-1 mr-3"
          />
          <span className="text-sm text-gray-700">
            I agree to the Terms & Conditions and Privacy Policy. I authorize OYO to verify my documents and process payments.
          </span>
        </label>
        {errors.agreeTerms && <p className="text-red-500 text-sm mt-1">{errors.agreeTerms.message}</p>}
      </div>
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <PersonalInfoStep />
      case 2: return <BusinessDetailsStep />
      case 3: return <VerificationStep />
      case 4: return <BankDetailsStep />
      default: return <PersonalInfoStep />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Become an OYO Partner</h1>
            <p className="text-gray-600 mt-2">Register your property and start earning</p>
          </div>

          {/* Google Sign-In Option */}
          <div className="mb-8">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Quick registration with Google</p>
              <div className="flex justify-center">
                <div ref={setGoogleBtnRef} />
              </div>
              <div className="mt-4 flex items-center">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="px-4 text-xs text-gray-500">OR</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
            </div>
          </div>

          <StepIndicator />

          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStep()}

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-2 rounded-lg font-medium ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              {currentStep === steps.length ? (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Submit Registration'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Next Step
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
