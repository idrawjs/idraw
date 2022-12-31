import fs from 'fs';
import path from 'path';

function removeFullDir(dirPath) {
  let files: string[] = [];
  if (fs.existsSync(dirPath)) {
    files = fs.readdirSync(dirPath);
    files.forEach((filename) => {
      const curPath: string = path.join(dirPath, filename);
      const stat = fs.statSync(curPath);
      if (stat.isDirectory()) {
        removeFullDir(curPath);
      } else if (stat.isFile()) {
        // fs.unlinkSync(curPath);
        fs.rmSync(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

module.exports = {
  removeFullDir
};
