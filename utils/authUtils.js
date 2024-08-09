import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from './prisma.js';

// Function to hash passwords
export async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

// Function to generate a JWT token
export const generateToken = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  return token;
};

// Function to authenticate user credentials
export const authenticateUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  console.log('authenticating user');
  console.log('user', user);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials');
  }

  return user;
};

// Function to verify JWT token
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Middleware to protect routes
export const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const user = verifyToken(token);
      req.user = user;
      next();
    } catch (error) {
      return res.sendStatus(403);
    }
  } else {
    res.sendStatus(401);
  }
};
