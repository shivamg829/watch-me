import multer from 'multer';

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/temp"); // Specify the destination directory for uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Create a unique filename
    }
});
const upload = multer({storage: storage});
export {upload};
