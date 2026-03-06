# Image Upload with Cloudinary - Complete Guide

## ✅ Features Implemented

1. ✅ Upload single image
2. ✅ Upload multiple images
3. ✅ Update image (auto-delete old)
4. ✅ Delete image
5. ✅ Database integration

---

## API Endpoints

### 1. Upload Single Image
```
POST /api/upload/single
Content-Type: multipart/form-data

Body:
- image: file
- folder: string (optional, default: 'general')

Response:
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "hotels/abc123"
  }
}
```

### 2. Upload Multiple Images
```
POST /api/upload/multiple
Content-Type: multipart/form-data

Body:
- images: file[] (max 10)
- folder: string (optional)

Response:
{
  "success": true,
  "data": [
    { "url": "...", "publicId": "..." },
    { "url": "...", "publicId": "..." }
  ]
}
```

### 3. Update User Profile Image (Auto-Delete Old)
```
PUT /api/upload/profile/:userId
Content-Type: multipart/form-data

Body:
- image: file

Response:
{
  "success": true,
  "message": "Profile image updated successfully",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "users/xyz789"
  }
}
```

**What Happens:**
1. Finds user's current profile image
2. Deletes old image from Cloudinary
3. Uploads new image
4. Updates database with new URL

### 4. Update Hotel Images
```
PUT /api/upload/hotel/:hotelId
Content-Type: multipart/form-data

Body:
- images: file[] (max 5)
- replaceAll: boolean (optional, default: false)

Response:
{
  "success": true,
  "data": {
    "uploadedImages": ["url1", "url2"],
    "totalImages": 7
  }
}
```

**Options:**
- `replaceAll=false`: Add new images to existing
- `replaceAll=true`: Delete all old images, upload new ones

### 5. Delete Image
```
DELETE /api/upload/image
Content-Type: application/json

Body:
{
  "publicId": "hotels/abc123",
  "userId": "user-id" (optional),
  "hotelId": "hotel-id" (optional)
}

Response:
{
  "success": true,
  "message": "Image deleted successfully"
}
```

**What Happens:**
1. Deletes image from Cloudinary
2. If userId provided: Removes from user profile
3. If hotelId provided: Removes from hotel images array

---

## Setup Steps

### 1. Get Cloudinary Credentials
```
1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Copy:
   - Cloud Name
   - API Key
   - API Secret
```

### 2. Update .env
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Use New Upload Route
In `server.js`, replace:
```javascript
const uploadRouter = require('./routes/upload');
```

With:
```javascript
const uploadRouter = require('./routes/upload-cloudinary');
```

---

## Usage Examples

### Flutter - Update Profile Image
```dart
Future<void> updateProfileImage(File imageFile, String userId) async {
  var request = http.MultipartRequest(
    'PUT',
    Uri.parse('$baseUrl/api/upload/profile/$userId'),
  );
  
  request.files.add(
    await http.MultipartFile.fromPath('image', imageFile.path),
  );
  
  var response = await request.send();
  var responseData = await response.stream.bytesToString();
  var result = json.decode(responseData);
  
  if (result['success']) {
    print('New image URL: ${result['data']['url']}');
    // Old image automatically deleted!
  }
}
```

### Flutter - Update Hotel Images (Replace All)
```dart
Future<void> replaceHotelImages(List<File> images, String hotelId) async {
  var request = http.MultipartRequest(
    'PUT',
    Uri.parse('$baseUrl/api/upload/hotel/$hotelId'),
  );
  
  // Add replaceAll flag
  request.fields['replaceAll'] = 'true';
  
  // Add all images
  for (var image in images) {
    request.files.add(
      await http.MultipartFile.fromPath('images', image.path),
    );
  }
  
  var response = await request.send();
  // Old images automatically deleted!
}
```

### React - Update Profile Image
```javascript
const updateProfileImage = async (file, userId) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await axios.put(
    `/api/upload/profile/${userId}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );
  
  console.log('New image URL:', response.data.data.url);
  // Old image automatically deleted!
};
```

---

## How It Works

### Update Flow:
```
1. User uploads new image
   ↓
2. Backend finds old image URL in database
   ↓
3. Extracts publicId from old URL
   ↓
4. Deletes old image from Cloudinary
   ↓
5. Uploads new image to Cloudinary
   ↓
6. Updates database with new URL
   ↓
7. Returns new URL to client
```

### Delete Flow:
```
1. Client sends publicId
   ↓
2. Backend deletes from Cloudinary
   ↓
3. Backend removes URL from database
   ↓
4. Returns success
```

---

## Database Storage

Images are stored as:
- **User**: `profileImage` (string) - Single URL
- **Hotel**: `images` (JSON string) - Array of URLs

Example:
```json
{
  "profileImage": "https://res.cloudinary.com/demo/users/abc123.jpg",
  "images": "[\"https://res.cloudinary.com/demo/hotels/img1.jpg\", \"https://res.cloudinary.com/demo/hotels/img2.jpg\"]"
}
```

---

## Testing

```bash
# 1. Upload image
curl -X POST http://localhost:5555/api/upload/single \
  -F "image=@photo.jpg" \
  -F "folder=users"

# 2. Update profile image (deletes old)
curl -X PUT http://localhost:5555/api/upload/profile/user-123 \
  -F "image=@new-photo.jpg"

# 3. Delete image
curl -X DELETE http://localhost:5555/api/upload/image \
  -H "Content-Type: application/json" \
  -d '{"publicId":"users/abc123","userId":"user-123"}'
```

---

## ✅ Summary

**What's Automatic:**
- ✅ Old image deleted when updating
- ✅ Database updated with new URL
- ✅ Cloudinary handles storage
- ✅ CDN delivery included

**What You Need:**
- Cloudinary account (FREE tier: 25GB)
- Add credentials to .env
- Use new upload routes

**Files Created:**
1. `src/lib/cloudinary.js` - Cloudinary service
2. `src/routes/upload-cloudinary.js` - Upload routes

**Next Step:**
Update `server.js` to use `upload-cloudinary.js` instead of `upload.js`
