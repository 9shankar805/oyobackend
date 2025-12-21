// AI-Powered Recommendation Engine
class RecommendationEngine {
  constructor() {
    this.userProfiles = new Map();
    this.hotelFeatures = new Map();
    this.bookingHistory = [];
  }

  // Collaborative Filtering
  calculateUserSimilarity(user1, user2) {
    const profile1 = this.userProfiles.get(user1);
    const profile2 = this.userProfiles.get(user2);
    
    if (!profile1 || !profile2) return 0;
    
    const keys = new Set([...Object.keys(profile1), ...Object.keys(profile2)]);
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    keys.forEach(key => {
      const val1 = profile1[key] || 0;
      const val2 = profile2[key] || 0;
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    });
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  // Content-Based Filtering
  getHotelRecommendations(userId, limit = 10) {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) return [];

    const scores = [];
    
    this.hotelFeatures.forEach((features, hotelId) => {
      let score = 0;
      
      // Price preference
      if (userProfile.priceRange) {
        const priceDiff = Math.abs(features.price - userProfile.priceRange.avg);
        score += Math.max(0, 1 - priceDiff / 1000);
      }
      
      // Location preference
      if (userProfile.preferredLocations) {
        if (userProfile.preferredLocations.includes(features.location)) {
          score += 0.3;
        }
      }
      
      // Amenities preference
      if (userProfile.preferredAmenities) {
        const matchingAmenities = features.amenities.filter(a => 
          userProfile.preferredAmenities.includes(a)
        ).length;
        score += matchingAmenities * 0.1;
      }
      
      // Rating preference
      score += features.rating * 0.2;
      
      scores.push({ hotelId, score, features });
    });
    
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        hotelId: item.hotelId,
        score: item.score,
        reason: this.generateRecommendationReason(userProfile, item.features),
      }));
  }

  // Generate explanation for recommendation
  generateRecommendationReason(userProfile, hotelFeatures) {
    const reasons = [];
    
    if (userProfile.priceRange && 
        hotelFeatures.price >= userProfile.priceRange.min && 
        hotelFeatures.price <= userProfile.priceRange.max) {
      reasons.push('Matches your budget');
    }
    
    if (userProfile.preferredLocations?.includes(hotelFeatures.location)) {
      reasons.push('In your preferred area');
    }
    
    if (hotelFeatures.rating >= 4.0) {
      reasons.push('Highly rated');
    }
    
    const matchingAmenities = hotelFeatures.amenities.filter(a => 
      userProfile.preferredAmenities?.includes(a)
    );
    if (matchingAmenities.length > 0) {
      reasons.push(`Has ${matchingAmenities.join(', ')}`);
    }
    
    return reasons.join(' • ');
  }

  // Update user profile based on behavior
  updateUserProfile(userId, booking) {
    let profile = this.userProfiles.get(userId) || {
      priceRange: { min: 0, max: 10000, avg: 2500 },
      preferredLocations: [],
      preferredAmenities: [],
      bookingCount: 0,
    };
    
    // Update price preferences
    profile.priceRange.avg = (profile.priceRange.avg * profile.bookingCount + booking.price) / (profile.bookingCount + 1);
    
    // Update location preferences
    if (!profile.preferredLocations.includes(booking.location)) {
      profile.preferredLocations.push(booking.location);
    }
    
    // Update amenity preferences
    booking.amenities?.forEach(amenity => {
      if (!profile.preferredAmenities.includes(amenity)) {
        profile.preferredAmenities.push(amenity);
      }
    });
    
    profile.bookingCount++;
    this.userProfiles.set(userId, profile);
  }

  // Trending hotels based on recent bookings
  getTrendingHotels(limit = 5) {
    const recentBookings = this.bookingHistory
      .filter(b => new Date(b.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    const hotelCounts = {};
    recentBookings.forEach(booking => {
      hotelCounts[booking.hotelId] = (hotelCounts[booking.hotelId] || 0) + 1;
    });
    
    return Object.entries(hotelCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([hotelId, count]) => ({ hotelId, bookings: count }));
  }

  // Personalized price prediction
  predictOptimalPrice(userId, hotelId) {
    const userProfile = this.userProfiles.get(userId);
    const hotelFeatures = this.hotelFeatures.get(hotelId);
    
    if (!userProfile || !hotelFeatures) return hotelFeatures?.price || 2500;
    
    let basePrice = hotelFeatures.price;
    
    // Adjust based on user's price sensitivity
    if (userProfile.priceRange.avg < basePrice) {
      basePrice *= 0.9; // 10% discount for price-sensitive users
    }
    
    // Seasonal adjustment
    const month = new Date().getMonth();
    const seasonalMultiplier = [0.8, 0.8, 0.9, 1.0, 1.1, 1.2, 1.2, 1.1, 1.0, 0.9, 0.8, 0.8][month];
    
    return Math.round(basePrice * seasonalMultiplier);
  }
}

module.exports = RecommendationEngine;