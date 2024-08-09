import express from 'express';
import { authenticateUser, generateToken } from '../utils/authUtils.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    try {
        const user = await authenticateUser(email, password, prisma);
        console.log("user");
        console.log(user);
        const token = generateToken(user);
        res.send({ token });
    } catch (error) {
        console.log(error.message)
        res.status(401).send({ message: error.message });
    }
});

export default router;