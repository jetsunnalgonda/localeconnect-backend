import fs from 'fs';
import multer from 'multer';

// Ensure the uploads directory exists
const uploadDir = './uploads';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

export const upload = multer({ storage });

// Function to process avatars and return their paths
export async function uploadAvatarsToPath(avatarFiles) {
    const avatars = avatarFiles.length > 0
        ? avatarFiles.map(file => ({ url: file.path }))
        : []; // Handle case where no files are uploaded
    return avatars;
}
