const express = require('express');
const multer = require('multer');
const Image = require('../models/Image');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Store upload in memory, cap at 10MB, images only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  }
});

// Public: list images (metadata only, not raw bytes), optionally filtered by category
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;

  const images = await Image.find(filter)
    .select('-data')
    .sort({ uploadedAt: -1 });
  res.json(images);
});

// Public: serve the actual image bytes
router.get('/:id/file', async (req, res) => {
  const image = await Image.findById(req.params.id);
  if (!image) return res.status(404).send('Not found');
  res.set('Content-Type', image.mimetype);
  res.set('Cache-Control', 'public, max-age=31536000');
  res.send(image.data);
});

// Admin: upload a photo into a category
router.post('/', requireAdmin, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { category, caption } = req.body;
    if (!category) return res.status(400).json({ error: 'Category required' });

    const image = await Image.create({
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      data: req.file.buffer,
      size: req.file.size,
      category,
      caption: caption || ''
    });

    const { data, ...meta } = image.toObject();
    res.status(201).json(meta);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// Admin: delete a photo
router.delete('/:id', requireAdmin, async (req, res) => {
  const result = await Image.deleteOne({ _id: req.params.id });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Image not found' });
  res.json({ success: true });
});

module.exports = router;
