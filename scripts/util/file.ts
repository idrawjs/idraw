import fs from 'fs';
// import path from 'path';

function removeFullDir(dirPath: string) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    fs.rmSync(dirPath, { recursive: true });
  }
}

export { removeFullDir };
