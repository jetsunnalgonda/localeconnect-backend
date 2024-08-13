import express from 'express';
import { upload } from '../multerConfig.js';
import { hashPassword, generateAccessToken, generateRefreshToken } from '../utils/authUtils.js';
import { parseLocationData } from '../utils/locationUtils.js';
import { uploadAvatarsToS3 } from '../utils/s3Utils.js';
import { createNewUser } from '../utils/userService.js';

const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', upload.array('avatars', 5), async (req, res) => {
    console.log('Files:', req.files);
    console.log('Body:', req.body);

    try {
        const { name, email, password, bio, location } = req.body;
        const avatarFiles = req.files || []; // Default to an empty array if undefined

        const hashedPassword = await hashPassword(password);
        const locationData = parseLocationData(location);
        const avatars = await uploadAvatarsToS3(avatarFiles);

        // Map avatars to match the expected structure
        // const avatarData = avatars.map(url => ({ url }));
        // console.log('Avatar data:', avatarData);
        
        const newUser = await createNewUser({ name, email, hashedPassword, bio, avatars, locationData });

        const token = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken(newUser);
        res.status(201).send({ token, refreshToken });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send({ message: 'Error creating user', error: error.message });
    }
});

export default router;
