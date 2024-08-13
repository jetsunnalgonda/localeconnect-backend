import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../utils/authUtils'

router.post('/refresh', async (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh Token is required' });
  }

  try {
    // Verify if the refresh token is valid
    const user = verifyRefreshToken(refreshToken);

    // Generate new access and refresh tokens
    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    // Optionally, store the new refresh token in the database or invalidate the old one

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return res.status(403).json({ message: 'Invalid Refresh Token' });
  }
});

export default router;
