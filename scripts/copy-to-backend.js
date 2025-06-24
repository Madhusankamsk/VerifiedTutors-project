import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '../dist');
const targetDir = path.join(__dirname, '../../backend/public');

// Ensure the target directory exists
fs.ensureDirSync(targetDir);

// Copy the build files
try {
  fs.copySync(sourceDir, targetDir, { overwrite: true });
  console.log('Successfully copied build files to backend/public directory');
} catch (err) {
  console.error('Error copying build files:', err);
  process.exit(1);
} 