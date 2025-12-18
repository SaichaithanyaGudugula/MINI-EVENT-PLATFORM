const express = require('express');
const {
  upload,
  getEvents,
  getEventById,
  getMyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpJoin,
  rsvpLeave,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getEvents);
router.get('/mine', getMyEvents);
router.get('/:id', getEventById);
router.post('/', upload.single('image'), createEvent);
router.put('/:id', upload.single('image'), updateEvent);
router.delete('/:id', deleteEvent);

router.post('/:id/rsvp', rsvpJoin);
router.delete('/:id/rsvp', rsvpLeave);

module.exports = router;