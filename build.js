#!/usr/bin/env node

/**
 * Build script for Before & After Pro
 * Handles optimization, minification, and asset preparation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building Before & After Pro...');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
    console.log('📁 Created dist directory');
}

// Copy and optimize HTML
const htmlContent = fs.readFileSync('index.html', 'utf8');
const optimizedHtml = htmlContent
    .replace(/\s+/g, ' ') // Remove extra whitespace
    .replace(/>\s+</g, '><'); // Remove whitespace between tags

fs.writeFileSync(path.join(distDir, 'index.html'), optimizedHtml);
console.log('✅ Optimized HTML');

// Copy and optimize CSS
const cssContent = fs.readFileSync('styles.css', 'utf8');
const optimizedCss = cssContent
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Remove extra whitespace
    .replace(/;\s*}/g, '}') // Remove trailing semicolons
    .replace(/:\s+/g, ':') // Remove space after colons
    .replace(/;\s+/g, ';') // Remove space after semicolons
    .trim();

fs.writeFileSync(path.join(distDir, 'styles.css'), optimizedCss);
console.log('✅ Optimized CSS');

// Copy and optimize JavaScript
const jsContent = fs.readFileSync('app.js', 'utf8');
const optimizedJs = jsContent
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/\s+/g, ' ') // Remove extra whitespace
    .replace(/\s*{\s*/g, '{') // Remove space around braces
    .replace(/\s*}\s*/g, '}') // Remove space around braces
    .replace(/\s*;\s*/g, ';') // Remove space around semicolons
    .trim();

fs.writeFileSync(path.join(distDir, 'app.js'), optimizedJs);
console.log('✅ Optimized JavaScript');

// Copy other files
const filesToCopy = ['manifest.json', 'sw.js'];
filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(distDir, file));
        console.log(`📋 Copied ${file}`);
    }
});

// Create optimized package.json for production
const packageJson = {
    name: "before-after-pro",
    version: "1.0.0",
    description: "Professional before-and-after image generator for clinics",
    main: "index.html",
    scripts: {
        "start": "serve dist",
        "build": "node build.js",
        "dev": "serve ."
    },
    dependencies: {},
    devDependencies: {
        "serve": "^14.0.0"
    },
    keywords: ["before-after", "clinic", "image-generator", "pwa"],
    author: "Before & After Pro",
    license: "MIT"
};

fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(packageJson, null, 2));
console.log('📦 Created package.json');

// Create .htaccess for Apache servers
const htaccess = `
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Enable caching
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
`;

fs.writeFileSync(path.join(distDir, '.htaccess'), htaccess.trim());
console.log('🔒 Created .htaccess');

// Calculate file sizes
const getFileSize = (filePath) => {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2);
};

console.log('\n📊 Build Summary:');
console.log(`HTML: ${getFileSize(path.join(distDir, 'index.html'))} KB`);
console.log(`CSS: ${getFileSize(path.join(distDir, 'styles.css'))} KB`);
console.log(`JavaScript: ${getFileSize(path.join(distDir, 'app.js'))} KB`);
console.log(`Total: ${(parseFloat(getFileSize(path.join(distDir, 'index.html'))) + parseFloat(getFileSize(path.join(distDir, 'styles.css'))) + parseFloat(getFileSize(path.join(distDir, 'app.js')))).toFixed(2)} KB`);

console.log('\n🎉 Build completed successfully!');
console.log('📁 Output directory: dist/');
console.log('🌐 Serve with: npm start'); 