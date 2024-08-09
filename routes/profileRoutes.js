// profileRoutes.js
import express from 'express';
import { upload } from '../multerConfig.js';
import { uploadAvatarsToS3 } from '../utils/s3Utils.js';

import { authenticateJWT } from '../utils/authUtils.js';
import prisma from '../utils/prisma.js';
// import upload from './utils/upload.js'; 

const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// Profile route (requires authentication)
router.get('/profile', authenticateJWT, async (req, res) => {
    const userId = req.user.id; // Get user ID from the authenticated token

    try {
        // Fetch user profile data, including avatars and location
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                avatars: true,
                location: true,
            },
        });

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Update profile route
router.put('/profile', authenticateJWT, upload.array('avatars', 5), async (req, res) => {
    const { name, bio, email, location } = req.body;
    const avatarFiles = req.files;
    const userId = req.user.id;

    console.log('Request body:', req.body);
    console.log('Avatar files:', avatarFiles);

    let locationData;
    if (typeof location === 'string') {
        try {
            locationData = JSON.parse(location);
        } catch (error) {
            console.error('Error parsing location:', error);
            return res.status(400).send({ message: 'Invalid location data' });
        }
    } else {
        locationData = location;
    }

    try {
        const updateData = {
            name,
            bio,
            email,
            location: locationData ? {
                update: {
                    latitude: locationData.latitude,
                    longitude: locationData.longitude,
                    placeName: locationData.placeName // Update placeName
                }
            } : undefined
        };

        // If avatar files are provided, update avatars
        if (avatarFiles && avatarFiles.length > 0) {
            // const avatars = avatarFiles.map(file => ({ url: file.path }));
            const avatars = await uploadAvatarsToS3(avatarFiles);
            // const uploadResult = await uploadAvatarsToS3(req.files);
            // Upload avatars to S3 using the memory buffer
            // const uploadResult = await uploadAvatarsToS3(avatarFiles.map(file => ({
            //     buffer: file.buffer,
            //     originalname: file.originalname
            // })));
            // const avatarUrls = uploadResult.map(file => file.location); // S3 file URLs

            updateData.avatars = {
                deleteMany: {},
                create: avatars,
            };
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: {
                avatars: true,
                location: true,
            },
        });
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

export default router;
