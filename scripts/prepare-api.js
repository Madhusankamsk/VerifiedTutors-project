import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const rootDir = path.join(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const distDir = path.join(rootDir, 'dist');
const apiDir = path.join(distDir, 'api');

// Ensure directories exist
fs.ensureDirSync(distDir);
fs.ensureDirSync(apiDir);

// Create main API handler
const createApiHandler = () => {
  const serverJsPath = path.join(backendDir, 'server.js');
  const vercelServerPath = path.join(apiDir, 'index.js');
  
  // Read the original server.js
  const serverContent = fs.readFileSync(serverJsPath, 'utf-8');
  
  // Modify for Vercel serverless functions
  const modifiedContent = serverContent
    .replace(
      // Replace the server starting section
      /connectDB\(\)\.then\(\(\) => \{[\s\S]*?\}\);/,
      'export default async (req, res) => {\n' +
      '  await connectDB();\n' +
      '  return app(req, res);\n' +
      '};'
    )
    .replace(
      // Update CORS configuration for Vercel
      /app\.use\(cors\(\{[\s\S]*?\}\)\);/,
      'app.use(cors({\n' +
      '  origin: process.env.NODE_ENV === "production" ? [process.env.VERCEL_URL, process.env.FRONTEND_URL, `https://${process.env.VERCEL_URL}`] : "*",\n' +
      '  credentials: true,\n' +
      '}));'
    );
  
  // Write the modified file
  fs.writeFileSync(vercelServerPath, modifiedContent);
  console.log('Created Vercel API handler');
};

// Copy necessary backend files to the API directory
const copyBackendFiles = () => {
  // Copy config files
  fs.copySync(path.join(backendDir, 'config'), path.join(apiDir, 'config'));
  
  // Copy controllers
  fs.copySync(path.join(backendDir, 'controllers'), path.join(apiDir, 'controllers'));
  
  // Copy middleware
  fs.copySync(path.join(backendDir, 'middleware'), path.join(apiDir, 'middleware'));
  
  // Copy models
  fs.copySync(path.join(backendDir, 'models'), path.join(apiDir, 'models'));
  
  // Copy routes
  fs.copySync(path.join(backendDir, 'routes'), path.join(apiDir, 'routes'));
  
  // Copy services
  fs.copySync(path.join(backendDir, 'services'), path.join(apiDir, 'services'));
  
  // Copy utils
  fs.copySync(path.join(backendDir, 'utils'), path.join(apiDir, 'utils'));
  
  console.log('Copied backend files to API directory');
};

// Create a vercel.env file with production settings
const createVercelEnvFile = () => {
  // Read existing env.example
  let envContent = '';
  try {
    envContent = fs.readFileSync(path.join(rootDir, 'env.example'), 'utf-8');
    
    // Update for production
    envContent = envContent
      .replace('NODE_ENV=development', 'NODE_ENV=production')
      .replace(/FRONTEND_URL=http:\/\/localhost:[0-9]+/, 'FRONTEND_URL=${VERCEL_URL}')
      .replace(/BACKEND_URL=http:\/\/localhost:[0-9]+/, 'BACKEND_URL=${VERCEL_URL}')
      .replace(/CALLBACK_URL=.*/, 'CALLBACK_URL=${VERCEL_URL}/api/auth/google/callback')
      .replace(/# Cookie Settings\nCOOKIE_SECRET=.*/, '# Cookie Settings\nCOOKIE_SECRET=your_cookie_secret_here\nCOOKIE_SECURE=true\nCOOKIE_DOMAIN=${VERCEL_URL}');
    
    // Add Vercel URL if not present
    if (!envContent.includes('VERCEL_URL=')) {
      envContent += '\n# Vercel URL (automatically set by Vercel)\nVERCEL_URL=${VERCEL_URL}\n';
    }
    
  } catch (error) {
    console.error('Error reading env.example:', error);
    envContent = `# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGO_URI=mongodb+srv://your_mongodb_username:your_mongodb_password@your_cluster.mongodb.net/your_database

# Frontend URL (Vercel URL)
FRONTEND_URL=\${VERCEL_URL}
VERCEL_URL=\${VERCEL_URL}

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# API Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Cookie Settings
COOKIE_SECRET=your_cookie_secret_here
COOKIE_SECURE=true
COOKIE_DOMAIN=\${VERCEL_URL}

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BACKEND_URL=\${VERCEL_URL}
CALLBACK_URL=\${VERCEL_URL}/api/auth/google/callback`;
  }

  fs.writeFileSync(path.join(rootDir, '.vercel.env.example'), envContent);
  console.log('Created .vercel.env.example file');
};

// Main function
const main = async () => {
  try {
    createApiHandler();
    copyBackendFiles();
    createVercelEnvFile();
    console.log('API preparation completed successfully');
  } catch (error) {
    console.error('Error preparing API:', error);
    process.exit(1);
  }
};

main(); 