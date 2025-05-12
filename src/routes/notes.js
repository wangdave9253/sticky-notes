// src/routes/notes.js
const express    = require('express');
const { StickyNote } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All /api/notes routes require a valid JWT
router.use(authenticate);

/**
 * GET /api/notes
 * List all notes belonging to the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const notes = await StickyNote.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

/**
 * GET /api/notes/:id
 * Get a single note by ID (if it belongs to the user)
 */
router.get('/:id', async (req, res) => {
  try {
    const note = await StickyNote.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch note' });
  }
});

/**
 * POST /api/notes
 * Create a new note for this user
 * Body: { title: string, content?: string }
 */
router.post('/', async (req, res) => {
  const { title, content } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }
  try {
    const newNote = await StickyNote.create({
      title,
      content: content || '',
      userId: req.user.id,
    });
    res.status(201).json(newNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create note' });
  }
});

/**
 * PUT /api/notes/:id
 * Update an existing note (only if it belongs to the user)
 * Body: { title?: string, content?: string }
 */
router.put('/:id', async (req, res) => {
  const { title, content } = req.body;
  try {
    const note = await StickyNote.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    await note.save();
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update note' });
  }
});

/**
 * DELETE /api/notes/:id
 * Delete a note (only if it belongs to the user)
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await StickyNote.destroy({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete note' });
  }
});

module.exports = router;
