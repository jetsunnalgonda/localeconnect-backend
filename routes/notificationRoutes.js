// routes/notificationRoutes.js
import express from 'express';
import { authenticateJWT } from '../utils/authUtils.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

// Get notifications for a user
// router.get('/notifications', authenticateJWT, async (req, res) => {
//     const userId = req.user.id;
//     // const userId = parseInt(req.params.userId, 10);

//     try {
//         const notifications = await prisma.notification.findMany({
//             where: { userId },
//             orderBy: { createdAt: 'desc' },
//         });

//         res.json(notifications);
//     } catch (error) {
//         console.error('Error fetching notifications:', error);
//         res.status(500).json({ error: 'An error occurred while fetching notifications.' });
//     }
// });

// Get notifications for a user
router.get('/notifications', authenticateJWT, async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch notifications for the user
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch additional details based on notification type
    const detailedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        let extraInfo = null;

        switch (notification.type) {
          case 'LIKE':
            extraInfo = await prisma.like.findUnique({
              where: { id: notification.referenceId },
              include: {
                liker: {
                  include: {
                    avatars: true,   // Include the liker’s avatars
                    location: true,  // Include the liker’s location
                  },
                },
              },
            });
            break;

          case 'MESSAGE':
            extraInfo = await prisma.message.findUnique({
              where: { id: notification.referenceId },
              include: {
                sender: {
                  include: {
                    avatars: true,   // Include the sender’s avatars
                    location: true,  // Include the sender’s location
                  },
                },
              },
            });
            break;

          case 'FOLLOW':
            extraInfo = await prisma.follow.findUnique({
              where: { id: notification.referenceId },
              include: {
                follower: {
                  include: {
                    avatars: true,   // Include the follower’s avatars
                    location: true,  // Include the follower’s location
                  },
                },
              },
            });
            break;

          default:
            break;
        }

        // Attach the fetched data to the notification
        return {
          ...notification,
          extraInfo,
        };
      })
    );

    // Return the detailed notifications
    res.json(detailedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});



export default router;