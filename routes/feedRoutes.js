import express from 'express';
import { authenticateJWT } from '../utils/authUtils.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

const KM_TO_DEGREES_LAT = 1 / 111; // Approximate conversion factor from km to degrees latitude

function kmToDegreesLongitude(km, latitude) {
    return km / (111 * Math.cos(latitude * Math.PI / 180));
}

router.get('/nearby-users', async (req, res) => {
    const { latitude, longitude, radius } = req.query; // Expecting latitude, longitude, and radius as query parameters

    try {
        const users = await User.find({
            location: {
                $geoWithin: {
                    $centerSphere: [[longitude, latitude], radius / 3963.2] // Radius in miles
                }
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).send('Error fetching nearby users');
    }
});

// Users route (requires authentication)
router.get('/users', authenticateJWT, async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Feed (Nearby Users) route with location and radius as parameters
router.get('/feed', authenticateJWT, async (req, res) => {
    console.log('Getting feed');
    const { latitude, longitude, radiusKm = 1.0, page = 1, limit = 20 } = req.query;

    // Validate the parameters
    if (!latitude || !longitude) {
        return res.status(400).send({ message: 'Latitude and longitude are required' });
    }

    const radiusKmFloat = parseFloat(radiusKm);
    const latitudeFloat = parseFloat(latitude);
    const longitudeFloat = parseFloat(longitude);
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(latitudeFloat) || isNaN(longitudeFloat) || isNaN(radiusKmFloat) || isNaN(pageNumber) || isNaN(limitNumber)) {
        return res.status(400).send({ message: 'Invalid parameters' });
    }

    const radiusDegreesLat = radiusKmFloat * KM_TO_DEGREES_LAT;
    const radiusDegreesLng = kmToDegreesLongitude(radiusKmFloat, latitudeFloat);

    try {
        const nearbyUsers = await prisma.user.findMany({
            where: {
                id: { not: req.user.id },
                location: {
                    latitude: {
                        gte: latitudeFloat - radiusDegreesLat,
                        lte: latitudeFloat + radiusDegreesLat,
                    },
                    longitude: {
                        gte: longitudeFloat - radiusDegreesLng,
                        lte: longitudeFloat + radiusDegreesLng,
                    },
                },
            },
            include: { avatars: true, location: true },
            skip: (pageNumber - 1) * limitNumber,
            take: limitNumber,
        });

        // const manyUsers = null; 
        // await prisma.user.findMany({
        //     skip: 1, //(pageNumber - 1) * limitNumber,
        //     take: 1, //limitNumber,
        //     include: { avatars: true, location: true },
        // });

        res.json(nearbyUsers);
    } catch (error) {
        console.error('Internal server error', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Feed (Nearby Users) route
router.get('/feed-harvesine', authenticateJWT, async (req, res) => {
    const { latitude, longitude, radiusKm } = req.query;
    const userId = req.user.id;

    if (!latitude || !longitude || !radiusKm) {
        return res.status(400).send({ message: 'Missing parameters' });
    }

    try {
        const nearbyUsers = await prisma.$queryRaw`
        SELECT u.id, u.name, u.placeName, u.locationId, l.latitude, l.longitude, a.url AS avatarUrl,
          (6371 * acos(cos(radians(${latitude})) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(l.latitude)))) AS distance
        FROM User u
        JOIN Location l ON u.locationId = l.id
        LEFT JOIN Avatar a ON u.id = a.userId
        WHERE u.id != ${userId}
        HAVING distance <= ${radiusKm}
        ORDER BY distance;
      `;

        res.json(nearbyUsers);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Feed (Nearby Users) route
router.get('/feed2', authenticateJWT, async (req, res) => {
    const userId = req.user.id;
    const { radius = 5 } = req.query; // Default radius to 5 km if not provided

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { location: true },
        });

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const nearbyUsers = await prisma.user.findMany({
            where: {
                id: { not: userId },
                location: {
                    latitude: {
                        gte: user.location.latitude - radius / 111, // Approximate conversion from km to degrees
                        lte: user.location.latitude + radius / 111,
                    },
                    longitude: {
                        gte: user.location.longitude - radius / (111 * Math.cos(user.location.latitude * Math.PI / 180)),
                        lte: user.location.longitude + radius / (111 * Math.cos(user.location.latitude * Math.PI / 180)),
                    },
                },
            },
            include: { avatars: true, location: true },
        });

        res.json(nearbyUsers);
    } catch (error) {
        res.status(500).send({ message: 'Internal server error' });
    }
});

export default router;
