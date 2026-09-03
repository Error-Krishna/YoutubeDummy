import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        console.log("File uploaded on Cloudinary:", response.url);

        // Remove temporary local file after successful upload
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        console.error("Cloudinary upload error:", error);

        // Remove temporary file if upload failed
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

const deleteFromCloudinary = async (
    publicId,
    resourceType = "image"
) => {
    try {
        if (!publicId) {
            return null;
        }

        const response = await cloudinary.uploader.destroy(
            publicId,
            {
                resource_type: resourceType,
            }
        );

        console.log(
            `Cloudinary ${resourceType} deleted:`,
            publicId,
            response.result
        );

        return response;

    } catch (error) {
        console.error(
            "Cloudinary delete error:",
            error
        );

        return null;
    }
};

export {
    uploadOnCloudinary,
    deleteFromCloudinary
};