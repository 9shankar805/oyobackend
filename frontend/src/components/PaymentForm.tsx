import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  amount: number;
  bookingId: string;
}

interface PaymentFormProps {
  bookingDetails: {
    id: string;
    hotelName: string;
    totalAmount: number;
    checkIn: string;
    checkOut: string;
  };
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  bookingDetails,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentFormData>();

  const processPayment = async (data: PaymentFormData) => {
    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock payment success
      const paymentId = `pay_${Date.now()}`;
      onPaymentSuccess(paymentId);
    } catch (error) {
      onPaymentError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
      
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold">{bookingDetails.hotelName}</h3>
        <p className="text-sm text-gray-600">
          {bookingDetails.checkIn} - {bookingDetails.checkOut}
        </p>
        <p className="text-lg font-bold text-green-600">
          ₹{bookingDetails.totalAmount}
        </p>
      </div>

      <form onSubmit={handleSubmit(processPayment)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Card Number</label>
          <input
            {...register('cardNumber', { 
              required: 'Card number is required',
              pattern: {
                value: /^\d{16}$/,
                message: 'Enter valid 16-digit card number'
              }
            })}
            className="w-full p-3 border rounded-lg"
            placeholder="1234 5678 9012 3456"
            maxLength={16}
          />
          {errors.cardNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Expiry Date</label>
            <input
              {...register('expiryDate', { 
                required: 'Expiry date is required',
                pattern: {
                  value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                  message: 'Enter valid MM/YY format'
                }
              })}
              className="w-full p-3 border rounded-lg"
              placeholder="MM/YY"
              maxLength={5}
            />
            {errors.expiryDate && (
              <p className="text-red-500 text-sm mt-1">{errors.expiryDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">CVV</label>
            <input
              {...register('cvv', { 
                required: 'CVV is required',
                pattern: {
                  value: /^\d{3,4}$/,
                  message: 'Enter valid CVV'
                }
              })}
              className="w-full p-3 border rounded-lg"
              placeholder="123"
              maxLength={4}
            />
            {errors.cvv && (
              <p className="text-red-500 text-sm mt-1">{errors.cvv.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cardholder Name</label>
          <input
            {...register('cardholderName', { required: 'Cardholder name is required' })}
            className="w-full p-3 border rounded-lg"
            placeholder="John Doe"
          />
          {errors.cardholderName && (
            <p className="text-red-500 text-sm mt-1">{errors.cardholderName.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : `Pay ₹${bookingDetails.totalAmount}`}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>🔒 Your payment information is secure and encrypted</p>
      </div>
    </div>
  );
};