import prisma from './prisma.js';

export async function createNewUser({ name, email, hashedPassword, bio, avatars, locationData }) {
    return await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            bio,
            avatars: avatars.length > 0 ? { create: avatars } : undefined,
            location: {
                create: {
                    latitude: locationData.latitude || null,
                    longitude: locationData.longitude || null,
                    placeName: locationData.placeName || null,
                }
            }
        },
        include: {
            avatars: true,
            location: true
        }
    });
}
