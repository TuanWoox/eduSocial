const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      // Define upload folder and set resource type based on the file's MIME type
      let folder = 'eduSocial'; // Set the default folder
      let resource_type = 'auto'; // 'auto' lets Cloudinary determine based on the file type
      // Return the configuration object
      return {
        folder,
        resource_type,  // Automatically determine image or video based on MIME type
      };
    },
});

// Export the storage configuration for use in other parts of your application
module.exports = {
    cloudinary,
    storage
};