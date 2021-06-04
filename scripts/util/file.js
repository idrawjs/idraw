const fs = require('fs');
const path = require('path');

function removeFullDir(dirPath) {
  let files = [];
  if (fs.existsSync(dirPath)) {
    files = fs.readdirSync(dirPath);
    files.forEach((filename) => {
      let curPath = path.join(dirPath, filename);
      const stat = fs.statSync(curPath);
      if(stat.isDirectory()) {
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
  removeFullDir,
}