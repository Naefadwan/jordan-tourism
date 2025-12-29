const Room = require('../models/roomModel');

exports.getRoomsByAccommodation = async (req, res) => {
    try {
        const { accommodationId } = req.params;
        const rooms = await Room.findByAccommodationId(accommodationId);
        res.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createRoom = async (req, res) => {
    try {
        const roomData = req.body;
        const newRoom = await Room.create(roomData);
        res.status(201).json(newRoom);
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const roomData = req.body;
        const updatedRoom = await Room.update(id, roomData);
        if (!updatedRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json(updatedRoom);
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRoom = await Room.delete(id);
        if (!deletedRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
