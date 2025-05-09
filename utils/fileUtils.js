const path = require('path');

exports.getChunkDir = (baseDir, fileHash) => 
  path.resolve(baseDir, `chunkCache_${fileHash}`);

exports.extractExt = (fileName) => 
  fileName.slice(fileName.lastIndexOf('.'));

exports.resolvePost = (req) => {
  return new Promise((resolve) => {
    let chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString())));
  });
};