// import { PrismaClient } from '@prisma/client';
// const prismaClient = new PrismaClient();

import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const libsql = createClient({
  url: `${process.env.TURSO_DATABASE_URL}`,
  authToken: `${process.env.TURSO_AUTH_TOKEN}`,
})

const adapter = new PrismaLibSQL(libsql)
const prisma = new PrismaClient({ adapter })

// Update avatar URL
export const updateAvatar = async (req, res) => {
  const { userId } = req.user; // using JWT for authentication
  const { avatarUrl } = req.body;

  try {
    // Find or create avatar record
    let avatar = await prismaClient.avatar.findUnique({
      where: { userId },
    });

    if (avatar) {
      // Update existing avatar URL
      avatar = await prismaClient.avatar.update({
        where: { userId },
        data: { url: avatarUrl },
      });
    } else {
      // Create new avatar record
      avatar = await prismaClient.avatar.create({
        data: { url: avatarUrl, userId },
      });
    }

    res.status(200).json(avatar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete avatar
export const deleteAvatar = async (req, res) => {
    const { avatarId } = req.params;
  
    try {
      // Delete the avatar record
      await prismaClient.avatar.delete({
        where: { id: Number(avatarId) },
      });
  
      res.status(200).json({ message: 'Avatar deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  