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
              include: { liker: true }, // Fetch the user who liked the profile
            });
            break;
          case 'MESSAGE':
            extraInfo = await prisma.message.findUnique({
              where: { id: notification.referenceId },
              include: { sender: true }, // Fetch the user who sent the message
            });
            break;
          case 'FOLLOW':
            extraInfo = await prisma.follow.findUnique({
              where: { id: notification.referenceId },
              include: { follower: true }, // Fetch the user who followed
            });
            break;
          default:
            break;
        }

        return {
          ...notification,
          extraInfo, // Attach the fetched data to the notification
        };
      })
    );

    res.json(detailedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'An error occurred while fetching notifications.' });
  }
});


export default router;