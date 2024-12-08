const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('@fluidjs/multer-cloudinary');

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// Set up multer-storage-cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'EduSocial',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

// Export the storage configuration for use in other parts of your application
module.exports = {
    cloudinary,
    storage
};