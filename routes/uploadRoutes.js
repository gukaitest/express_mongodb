const express = require('express');
const router = express.Router();
const {
  uploadChunk,
  mergeChunks,
  verify,
} = require('../controllers/uploadController');

router.post('/upload', uploadChunk);
router.post('/merge', mergeChunks);
router.post('/verify', verify);

module.exports = router;
