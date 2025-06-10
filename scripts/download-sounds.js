const fs = require('fs');
const path = require('path');
const https = require('https');

const soundEffects = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',    // Game Notification Alert
  incorrect: 'https://assets.mixkit.co/active_storage/sfx/2873/2873-preview.mp3',  // Soft Error Tone
  click: 'https://assets.mixkit.co/active_storage/sfx/2876/2876-preview.mp3',      // Click Soft
  complete: 'https://assets.mixkit.co/active_storage/sfx/2891/2891-preview.mp3',   // Achievement Bell
  levelUp: 'https://assets.mixkit.co/active_storage/sfx/2886/2886-preview.mp3',    // Success Fanfare
  streak: 'https://assets.mixkit.co/active_storage/sfx/2882/2882-preview.mp3',     // Quick Win
};

const soundsDir = path.join(process.cwd(), 'public', 'sounds');

// Create sounds directory if it doesn't exist
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// Function to download a file
function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(soundsDir, filename);
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Download all sound effects
async function downloadSoundEffects() {
  console.log('Downloading sound effects...');
  
  try {
    await Promise.all(
      Object.entries(soundEffects).map(([name, url]) => 
        downloadFile(url, `${name}.mp3`)
      )
    );
    console.log('All sound effects downloaded successfully!');
  } catch (error) {
    console.error('Error downloading sound effects:', error);
    process.exit(1);
  }
}

downloadSoundEffects(); 