const express = require('express');
const Category = require('../models/Category');
const Image = require('../models/Image');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public: list all categories with image counts
router.get('/', async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  const counts = await Image.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  const countMap = {};
  counts.forEach(c => { countMap[c._id] = c.count; });

  const result = categories.map(c => ({
    _id: c._id,
    name: c.name,
    createdAt: c.createdAt,
    count: countMap[c._id] || 0
  }));
  res.json(result);
});

// Admin: create category
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Category name required' });

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) return res.status(409).json({ error: 'Category already exists' });

    const category = await Category.create({ name: name.trim() });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Could not create category' });
  }
});

// Admin: delete category (and its images)
router.delete('/:id', requireAdmin, async (req, res) => {
  await Image.deleteMany({ category: req.params.id });
  const result = await Category.deleteOne({ _id: req.params.id });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Category not found' });
  res.json({ success: true });
});

module.exports = router;
