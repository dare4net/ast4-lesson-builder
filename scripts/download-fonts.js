const fs = require('fs');
const path = require('path');
const https = require('https');

const FONT_URLS = {
  'DINRoundPro.woff2': 'https://db.onlinewebfonts.com/t/1c587cd97662ab09cb8d50f9c2fb7e1e.woff2',
  'DINRoundPro-Medium.woff2': 'https://db.onlinewebfonts.com/t/1c587cd97662ab09cb8d50f9c2fb7e1e.woff2',
  'DINRoundPro-Bold.woff2': 'https://db.onlinewebfonts.com/t/1c587cd97662ab09cb8d50f9c2fb7e1e.woff2',
};

const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');

// Create fonts directory if it doesn't exist
if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

// Download each font file
Object.entries(FONT_URLS).forEach(([filename, url]) => {
  const filePath = path.join(FONTS_DIR, filename);
  
  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`${filename} already exists, skipping...`);
    return;
  }

  console.log(`Downloading ${filename}...`);
  
  https.get(url, (response) => {
    if (response.statusCode === 200) {
      const file = fs.createWriteStream(filePath);
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename}`);
      });
    } else {
      console.error(`Failed to download ${filename}: ${response.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`Error downloading ${filename}:`, err.message);
  });
}); 