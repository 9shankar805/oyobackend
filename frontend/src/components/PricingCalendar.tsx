import React, { useState, useEffect } from 'react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

interface PriceData {
  date: string;
  price: number;
  available: boolean;
}

interface PricingCalendarProps {
  hotelId: string;
  roomType: string;
  onPriceUpdate: (date: string, price: number) => void;
  onAvailabilityUpdate: (date: string, available: boolean) => void;
}

export const PricingCalendar: React.FC<PricingCalendarProps> = ({
  hotelId,
  roomType,
  onPriceUpdate,
  onAvailabilityUpdate
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bulkPrice, setBulkPrice] = useState<number>(0);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);

  useEffect(() => {
    loadPriceData();
  }, [currentMonth, hotelId, roomType]);

  const loadPriceData = async () => {
    // Mock data - replace with actual API call
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    const mockData = days.map(day => ({
      date: format(day, 'yyyy-MM-dd'),
      price: Math.floor(Math.random() * 2000) + 1000,
      available: Math.random() > 0.2
    }));
    
    setPriceData(mockData);
  };

  const updatePrice = (date: string, newPrice: number) => {
    setPriceData(prev => 
      prev.map(item => 
        item.date === date ? { ...item, price: newPrice } : item
      )
    );
    onPriceUpdate(date, newPrice);
  };

  const toggleAvailability = (date: string) => {
    const item = priceData.find(p => p.date === date);
    if (item) {
      const newAvailability = !item.available;
      setPriceData(prev => 
        prev.map(p => 
          p.date === date ? { ...p, available: newAvailability } : p
        )
      );
      onAvailabilityUpdate(date, newAvailability);
    }
  };

  const applyBulkPricing = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      updatePrice(dateStr, bulkPrice);
    });
    
    setShowBulkUpdate(false);
    setBulkPrice(0);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const getDayData = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return priceData.find(p => p.date === dateStr);
  };

  const renderCalendarDay = (date: Date) => {
    const dayData = getDayData(date);
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isSelected = selectedDate && isSameDay(date, selectedDate);

    return (
      <div
        key={format(date, 'yyyy-MM-dd')}
        className={`
          p-2 border cursor-pointer transition-colors
          ${!isCurrentMonth ? 'text-gray-300 bg-gray-50' : ''}
          ${isSelected ? 'bg-blue-100 border-blue-500' : ''}
          ${dayData?.available ? 'bg-green-50' : 'bg-red-50'}
        `}
        onClick={() => setSelectedDate(date)}
      >
        <div className="text-sm font-medium">{format(date, 'd')}</div>
        {dayData && (
          <div className="text-xs">
            <div className="font-semibold">₹{dayData.price}</div>
            <div className={`text-xs ${dayData.available ? 'text-green-600' : 'text-red-600'}`}>
              {dayData.available ? 'Available' : 'Blocked'}
            </div>
          </div>
        )}
      </div>
    );
  };

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Pricing Calendar - {roomType}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkUpdate(!showBulkUpdate)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Bulk Update
          </button>
        </div>
      </div>

      {showBulkUpdate && (
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Bulk Price Update</h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={bulkPrice}
              onChange={(e) => setBulkPrice(Number(e.target.value))}
              placeholder="Enter price"
              className="px-3 py-2 border rounded"
            />
            <button
              onClick={applyBulkPricing}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Apply to Month
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Previous
        </button>
        <h3 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => navigateMonth('next')}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-gray-600">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(renderCalendarDay)}
      </div>

      {selectedDate && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">
            Update {format(selectedDate, 'MMM d, yyyy')}
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Price"
              className="px-3 py-2 border rounded"
              onChange={(e) => {
                const dateStr = format(selectedDate, 'yyyy-MM-dd');
                updatePrice(dateStr, Number(e.target.value));
              }}
            />
            <button
              onClick={() => {
                const dateStr = format(selectedDate, 'yyyy-MM-dd');
                toggleAvailability(dateStr);
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Toggle Availability
            </button>
          </div>
        </div>
      )}
    </div>
  );
};