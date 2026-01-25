// Generate favicon from SVG
const fs = require('fs');
const path = require('path');

// Create a simple HTML file that can be used to generate favicon
// For now, we'll use the SVG directly as the favicon (modern browsers support it)

const svgContent = fs.readFileSync(path.join(__dirname, 'public', 'logo.svg'), 'utf8');

// Create base64 encoded SVG for data URI
const base64Svg = Buffer.from(svgContent).toString('base64');
console.log('SVG favicon ready at public/logo.svg');
console.log('You can use this in your HTML as: <link rel="icon" type="image/svg+xml" href="/logo.svg">');

// Also create a simple PNG placeholder (32x32) - this would need proper conversion
// For proper ICO generation, you would typically use a build tool or online converter
