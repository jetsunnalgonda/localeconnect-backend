import express from 'express';
import { authenticateJWT } from '../utils/authUtils.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

// Toggle like status for a user
router.post('/like', authenticateJWT, async (req, res) => {
    const userId = req.user.id;
    const { likedUserId } = req.body;

    console.log(`[INFO] Received like/unlike request from user ${userId} for user ${likedUserId}`);

    try {
        // Check if the user and the liked user exist
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        const likedUserExists = await prisma.user.findUnique({ where: { id: likedUserId } });

        if (!userExists) {
            console.log(`[ERROR] User with ID ${userId} not found`);
            return res.status(404).send({ message: 'User not found' });
        }

        if (!likedUserExists) {
            console.log(`[ERROR] Liked user with ID ${likedUserId} not found`);
            return res.status(404).send({ message: 'Liked user not found' });
        }

        // Check if the like already exists
        const existingLike = await prisma.like.findUnique({
            where: {
                likerId_likedId: {
                    likerId: userId,
                    likedId: likedUserId,
                },
            },
        });

        if (existingLike) {
            // If like exists, delete it (unlike)
            await prisma.like.delete({
                where: {
                    id: existingLike.id,
                },
            });
            console.log(`[INFO] Successfully removed like record from user ${userId} to user ${likedUserId}`);
            res.status(200).send({ message: 'Like removed successfully' });
        } else {
            // If like does not exist, create it (like)
            const like = await prisma.like.create({
                data: {
                    liker: { connect: { id: userId } },
                    liked: { connect: { id: likedUserId } },
                },
            });
            console.log(`[INFO] Successfully created like record from user ${userId} to user ${likedUserId}`);
            res.json(like);
        }
    } catch (error) {
        console.error(`[ERROR] An error occurred: ${error.message}`, { error });
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Route to check if the current user liked the specified user
router.get('/check-like', authenticateJWT, async (req, res) => {
    const currentUserId = req.user.id;
    const { userIdToCheck } = req.query; // Use req.query for query parameters

    console.log('Query parameters:', req.query); // Log the query parameters for debugging

    console.log(`Checking like status for likerId: ${currentUserId}, likedId: ${userIdToCheck}`);


    try {
        if (!userIdToCheck || !currentUserId) {
            return res.status(400).json({ error: 'Missing user IDs' });
        }

        // Convert IDs to integers and validate
        const parsedUserIdToCheck = parseInt(userIdToCheck, 10);
        const parsedCurrentUserId = parseInt(currentUserId, 10);

        console.log(`Checking like status for likerId: ${parsedCurrentUserId}, likedId: ${parsedUserIdToCheck}`);

        console.log('Checking like...')

        if (isNaN(parsedUserIdToCheck) || isNaN(parsedCurrentUserId)) {
            return res.status(400).json({ error: 'Invalid user IDs' });
        }

        // Example database check (replace with actual database query)
        const like = await prisma.like.findFirst({
            where: {
                likerId: parsedCurrentUserId,
                likedId: parsedUserIdToCheck,
            },
        });


        return res.json({ liked: !!like });
    } catch (error) {
        console.error('Error checking like status', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Like a user
router.post('/likeOnly', authenticateJWT, async (req, res) => {
    const userId = req.user.id;
    const { likedUserId } = req.body;

    console.log(`[INFO] Received like request from user ${userId} to like user ${likedUserId}`);

    try {
        // Check if the user and the liked user exist
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        const likedUserExists = await prisma.user.findUnique({ where: { id: likedUserId } });

        if (!userExists) {
            console.log(`[ERROR] User with ID ${userId} not found`);
            return res.status(404).send({ message: 'User not found' });
        }

        if (!likedUserExists) {
            console.log(`[ERROR] Liked user with ID ${likedUserId} not found`);
            return res.status(404).send({ message: 'Liked user not found' });
        }

        // Check if the like already exists
        const existingLike = await prisma.like.findUnique({
            where: {
                likerId_likedId: {
                    likerId: userId,
                    likedId: likedUserId,
                },
            },
        });

        if (existingLike) {
            console.log(`[INFO] User ${userId} already liked user ${likedUserId}`);
            return res.status(400).send({ message: 'You have already liked this user' });
        }

        // Create the like record
        const like = await prisma.like.create({
            data: {
                liker: { connect: { id: userId } },
                liked: { connect: { id: likedUserId } },
            },
        });

        console.log(`[INFO] Successfully created like record: ${JSON.stringify(like)}`);
        res.json(like);
    } catch (error) {
        console.error(`[ERROR] An error occurred: ${error.message}`, { error });
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Unlike a user
router.post('/unlike', authenticateJWT, async (req, res) => {
    const userId = req.user.id;
    const { likedUserId } = req.body;

    console.log(`[INFO] Received unlike request from user ${userId} to unlike user ${likedUserId}`);

    try {
        // Check if the user and the liked user exist
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        const likedUserExists = await prisma.user.findUnique({ where: { id: likedUserId } });

        if (!userExists) {
            console.log(`[ERROR] User with ID ${userId} not found`);
            return res.status(404).send({ message: 'User not found' });
        }

        if (!likedUserExists) {
            console.log(`[ERROR] Liked user with ID ${likedUserId} not found`);
            return res.status(404).send({ message: 'Liked user not found' });
        }

        // Check if the like exists
        const existingLike = await prisma.like.findUnique({
            where: {
                likerId_likedId: {
                    likerId: userId,
                    likedId: likedUserId,
                },
            },
        });

        if (!existingLike) {
            console.log(`[INFO] No existing like found from user ${userId} to user ${likedUserId}`);
            return res.status(400).send({ message: 'Like record does not exist' });
        }

        // Delete the like record
        await prisma.like.delete({
            where: {
                id: existingLike.id,
            },
        });

        console.log(`[INFO] Successfully removed like record from user ${userId} to user ${likedUserId}`);
        res.status(200).send({ message: 'Like removed successfully' });
    } catch (error) {
        console.error(`[ERROR] An error occurred: ${error.message}`, { error });
        res.status(500).send({ message: 'Internal server error' });
    }
});


// Get likes for a user
router.get('/likes', authenticateJWT, async (req, res) => {
    const userId = req.user.id;

    try {
        const likes = await prisma.like.findMany({
            where: {
                userId,
            },
            include: {
                liked: true,
            },
        });
        res.json(likes);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});


export default router;