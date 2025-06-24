# VerifiedTutors

A platform for connecting students with verified tutors.

## Project Overview

VerifiedTutors is a full-stack application built with:
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, MongoDB

## Deploying to Vercel

This project is configured for deployment as a single application on Vercel, with both frontend and backend components.

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database
3. [Cloudinary](https://cloudinary.com) account for image storage (optional)

### Environment Variables

Create the following environment variables in your Vercel project settings:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CALLBACK_URL=https://your-vercel-url.vercel.app/api/auth/google/callback
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Deployment Steps

1. Fork or clone this repository
2. Connect your GitHub repository to Vercel
3. Configure the environment variables
4. Deploy!

Vercel will automatically:
1. Install dependencies
2. Build the frontend (React/TypeScript)
3. Set up the serverless API functions
4. Deploy everything to a global CDN

### Local Development

To run the project locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at http://localhost:5173 and will proxy API requests to the backend.

## Project Structure

```
/
├── src/                  # Frontend React application
├── backend/              # Backend Express application
├── dist/                 # Built frontend (generated)
│   └── api/              # Serverless API functions (generated)
├── scripts/              # Build scripts
└── vercel.json           # Vercel configuration
```

## License

[MIT](LICENSE) 