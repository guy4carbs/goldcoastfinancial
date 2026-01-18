# Firebase Image CDN Setup

## Overview
Firebase Storage is now configured as your image CDN for the Heritage website. Images are hosted on Firebase and can be uploaded/managed through the admin interface with Firebase Authentication.

## Admin Interface
- **Login**: http://localhost:4500/admin/login
- **Image Manager**: http://localhost:4500/admin/images (requires login)

## Features

### 1. Upload Images
- **Drag & Drop**: Drag images directly into the upload area
- **Click to Select**: Click the "Select Files" button to choose files
- **Multiple Uploads**: Upload multiple images at once
- **Folder Organization**: Choose which folder to upload to

### 2. Folders
Organize your images into different folders:
- **General Images**: Default folder for misc images
- **Hero Images**: Homepage hero section images
- **Product Images**: Product photos
- **Team Photos**: Staff/team member photos
- **Logos & Badges**: Company logos and trust badges

### 3. Manage Images
For each uploaded image you can:
- **Preview**: See a thumbnail of the image
- **Copy URL**: Click to copy the CDN URL to clipboard
- **Delete**: Remove images you no longer need

### 4. Using Images in Code
After uploading an image:
1. Click "Copy URL" button
2. Use the URL in your React components:

```tsx
<img src="https://firebasestorage.googleapis.com/..." alt="Description" />
```

Or save it as a constant:
```tsx
const HERO_IMAGE = "https://firebasestorage.googleapis.com/...";

<div style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
```

## Firebase Configuration

The Firebase config is located in:
- `client/src/lib/firebase.ts` - Main Firebase initialization
- `client/src/lib/storageUtils.ts` - Helper functions for upload/list/delete

## Quick Start - Create Your First Admin User

Before you can upload images, you need to create an admin user in Firebase:

### Step 1: Go to Firebase Authentication
1. Open Firebase Console: https://console.firebase.google.com/project/gold-coast-fnl/authentication
2. Click on "Users" tab
3. Click "Add user" button

### Step 2: Create Admin Account
1. Enter your admin email (e.g., `admin@goldcoastfnl.com`)
2. Enter a strong password (minimum 8 characters)
3. Click "Add user"

### Step 3: Login to Admin Panel
1. Navigate to: http://localhost:4500/admin/login
2. Enter the email and password you just created
3. You'll be redirected to the Image Manager

## Storage Rules (Already Configured)

Your Firebase Storage Rules are already set up correctly:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;  // Public can view images
      allow write: if request.auth != null;  // Only authenticated users can upload
    }
  }
}
```

This ensures:
- ✅ Anyone can view uploaded images (public CDN)
- ✅ Only authenticated admin users can upload/delete images

## Authentication System

The admin panel now uses Firebase Authentication:

### How It Works
1. **Login Page** (`/admin/login`) - Secure email/password authentication
2. **Protected Routes** - Admin pages require authentication
3. **Auto-redirect** - Unauthenticated users are sent to login
4. **Session Management** - Firebase handles session tokens securely

### Security Features
- ✅ Password hashing handled by Firebase
- ✅ Secure session tokens
- ✅ Automatic session refresh
- ✅ Protected API endpoints
- ✅ Sign out functionality

### Managing Admin Users
To add/remove admin users:
1. Go to Firebase Console > Authentication > Users
2. Add user: Click "Add user" button
3. Remove user: Click three dots > Delete user
4. Reset password: Click three dots > Reset password

## Troubleshooting

### Images not loading?
- Check Firebase Console > Storage to verify files uploaded
- Check browser console for CORS errors
- Verify Storage Rules allow public read

### Upload failing?
- Check file size (Firebase free tier: 5GB total, 10MB per file)
- Check Storage Rules allow write access
- Check browser console for errors

### Can't access admin page?
- Make sure you're on `/admin/images` route
- Check if route is properly registered in App.tsx
- Server should be running on port 5000

## CDN Benefits

✅ **Fast global delivery** - Firebase CDN is distributed worldwide
✅ **Automatic optimization** - Images served optimized
✅ **Scalable** - Handles traffic spikes automatically
✅ **Secure** - HTTPS by default
✅ **Free tier** - 5GB storage, 1GB/day downloads free
