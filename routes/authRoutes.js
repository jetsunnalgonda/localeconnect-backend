// routes/authRoutes.js
import express from 'express';
import { generateAccessToken } from '../utils/authUtils.js';
import { authenticateJWT } from '../auth copy.js';

const router = express.Router();

router.post('/get-token', authenticateJWT, (req, res) => {
    const user = req.user;

    // Generate the token
    const token = generateAccessToken(user.id);

    // Send the token back to the client
    res.json({ token });
});

export default router;
