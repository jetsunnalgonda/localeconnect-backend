import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello World!');
});

router.get('/test', (req, res) => {
    res.status(200).json({ message: 'Backend is working!' });
});

export default router;