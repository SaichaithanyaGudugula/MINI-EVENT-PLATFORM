const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Event = require('../models/Event');

// Multer setup - in-memory storage, since we upload directly to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder = 'mini-event-platform') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(fileBuffer);
  });

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  const events = await Event.find()
    .populate('createdBy', 'name email')
    .sort({ dateTime: 1 });

  const userId = req.user?._id?.toString();

  const withMeta = events.map((event) => {
    const attendeesCount = event.attendees.length;
    const isAttending = userId
      ? event.attendees.some((id) => id.toString() === userId)
      : false;
    const isFull = attendeesCount >= event.capacity;

    return {
      ...event.toObject(),
      attendeesCount,
      isAttending,
      isFull,
    };
  });

  return res.json(withMeta);
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const userId = req.user?._id?.toString();
  const attendeesCount = event.attendees.length;
  const isAttending = userId
    ? event.attendees.some((id) => id.toString() === userId)
    : false;
  const isFull = attendeesCount >= event.capacity;

  return res.json({
    ...event.toObject(),
    attendeesCount,
    isAttending,
    isFull,
  });
};

// @desc    Get events created by current user
// @route   GET /api/events/mine
// @access  Private
const getMyEvents = async (req, res) => {
  const events = await Event.find({ createdBy: req.user._id }).sort({ dateTime: 1 });
  return res.json(events);
};

// @desc    Create event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  const { title, description, dateTime, location, capacity } = req.body;

  if (!title || !description || !dateTime || !location || !capacity) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  let imageUrl;
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    } catch (error) {
      return res.status(500).json({ message: 'Image upload failed', error: error.message });
    }
  }

  const event = await Event.create({
    title,
    description,
    dateTime,
    location,
    capacity,
    imageUrl,
    createdBy: req.user._id,
  });

  return res.status(201).json(event);
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (only creator)
const updateEvent = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  if (event.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to edit this event' });
  }

  const { title, description, dateTime, location, capacity } = req.body;

  if (typeof capacity !== 'undefined' && capacity < event.attendees.length) {
    return res
      .status(400)
      .json({ message: 'New capacity cannot be less than current attendees count' });
  }

  let imageUrl = event.imageUrl;
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    } catch (error) {
      return res.status(500).json({ message: 'Image upload failed', error: error.message });
    }
  }

  event.title = title ?? event.title;
  event.description = description ?? event.description;
  event.dateTime = dateTime ?? event.dateTime;
  event.location = location ?? event.location;
  event.capacity = capacity ?? event.capacity;
  event.imageUrl = imageUrl;

  const updated = await event.save();
  return res.json(updated);
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (only creator)
const deleteEvent = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  if (event.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this event' });
  }

  await event.deleteOne();
  return res.json({ message: 'Event removed' });
};

// @desc    RSVP join (concurrency-safe)
// @route   POST /api/events/:id/rsvp
// @access  Private
const rsvpJoin = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  // Atomic operation: ensure user not already in attendees AND capacity not exceeded
  const updatedEvent = await Event.findOneAndUpdate(
    {
      _id: eventId,
      attendees: { $ne: userId }, // no duplicate RSVPs
      $expr: {
        $lt: [{ $size: '$attendees' }, '$capacity'], // capacity check
      },
    },
    {
      $addToSet: { attendees: userId }, // avoids duplicates at write level
    },
    { new: true }
  );

  if (!updatedEvent) {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    const isAlreadyAttending = event.attendees.some(
      (id) => id.toString() === userId.toString()
    );
    if (isAlreadyAttending) {
      return res.status(400).json({ message: 'You have already RSVPed to this event' });
    }
    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }
    return res.status(400).json({ message: 'Unable to RSVP to event' });
  }

  return res.json({
    message: 'RSVP successful',
    attendeesCount: updatedEvent.attendees.length,
  });
};

// @desc    RSVP leave (concurrency-safe)
// @route   DELETE /api/events/:id/rsvp
// @access  Private
const rsvpLeave = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  const updatedEvent = await Event.findOneAndUpdate(
    {
      _id: eventId,
      attendees: userId, // must currently be attending
    },
    {
      $pull: { attendees: userId },
    },
    { new: true }
  );

  if (!updatedEvent) {
    return res.status(400).json({ message: 'You are not attending this event' });
  }

  return res.json({
    message: 'RSVP cancelled',
    attendeesCount: updatedEvent.attendees.length,
  });
};

module.exports = {
  upload,
  getEvents,
  getEventById,
  getMyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpJoin,
  rsvpLeave,
};