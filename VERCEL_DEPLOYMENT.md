# Deploying to Vercel

This guide will help you deploy the VerifiedTutors application to Vercel as a single project.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. Your MongoDB Atlas database is set up and accessible
3. Your Cloudinary account is set up (for image uploads)
4. Google OAuth credentials are configured

## Step 1: Fork or Clone the Repository

Make sure you have the latest version of the code.

## Step 2: Set Up Environment Variables

Before deploying, you'll need to set up environment variables in Vercel:

1. Go to your Vercel dashboard
2. Create a new project and link your repository
3. Go to the "Settings" tab, then "Environment Variables"
4. Add the following environment variables:

```
# Server Configuration
NODE_ENV=production

# MongoDB Configuration
MONGO_URI=mongodb+srv://madhusanka:hi4fdP5pn8dcwGFv@cluster0.0a4mi.mongodb.net/

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dzy1iaw8q
CLOUDINARY_API_KEY=841346714991634
CLOUDINARY_API_SECRET=cPAwJv__HuKx0odKM0qlyspmZm0

# API Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Cookie Settings
COOKIE_SECRET=your_cookie_secret_here
COOKIE_SECURE=true

# Google OAuth Configuration
GOOGLE_CLIENT_ID=382632989651-3mgkee8131huuje975uk97o6mcl1ne7c.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
CALLBACK_URL=${VERCEL_URL}/api/auth/google/callback
```

> **Important**: Replace any placeholder values with your actual credentials. Vercel will automatically set the `VERCEL_URL` environment variable.

## Step 3: Configure Build Settings

In your Vercel project settings:

1. Build Command: `npm run build:vercel`
2. Output Directory: `dist`
3. Install Command: `npm install`

## Step 4: Deploy

1. Push your changes to your repository
2. In the Vercel dashboard, click "Deploy"
3. Wait for the build and deployment to complete

## Step 5: Update Google OAuth Settings

After deployment:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your project's OAuth consent screen
3. Add your Vercel domain to the authorized domains
4. Update your OAuth credentials with the new callback URL:
   - `https://your-vercel-url.vercel.app/api/auth/google/callback`

## Troubleshooting

### CORS Issues

If you encounter CORS issues:

1. Make sure your frontend URL is correctly set in the environment variables
2. Check that the CORS configuration in the API is correctly set up

### MongoDB Connection Issues

If you can't connect to MongoDB:

1. Verify your MongoDB connection string is correct
2. Ensure your MongoDB Atlas cluster is configured to accept connections from anywhere (0.0.0.0/0)

### Serverless Function Timeouts

If your API calls are timing out:

1. Check the Vercel function logs for errors
2. Consider optimizing your database queries
3. You may need to upgrade your Vercel plan for longer function execution times

## Monitoring

After deployment, you can monitor your application:

1. Vercel dashboard provides deployment logs and function metrics
2. Check MongoDB Atlas for database performance
3. Set up logging with a service like Sentry or LogRocket for production error tracking 