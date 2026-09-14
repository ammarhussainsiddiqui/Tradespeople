import { GetObjectCommand , DeleteObjectCommand , S3Client } from '@aws-sdk/client-s3'; // Ensure you import GetObjectCommand
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";// Ensure you import getSignedUrl
import { Upload } from '@aws-sdk/lib-storage'; // Ensure to import Upload
import { v4 as uuidv4 } from 'uuid'; // Ensure to import uuid
import * as Sentry from '@sentry/nextjs';
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});

export const  uploadFilesToS3 = async (files) => {
    try {
        if (!files.length) {
            return { error: "No files uploaded" };
        }

        // Ensure the AWS bucket name is set
        const bucketName = process.env.AWS_BUCKET_NAME;
        if (!bucketName) {
            return { error: "AWS bucket name not configured" };
        }

        const uploadedFiles = []; // Array to hold names of uploaded files

        // Loop through each file and upload
        for (const file of files) {
            const fileName = `${uuidv4()}-${file.name}`;

            // Prepare the upload parameters
            const uploadParams = {
                Bucket: bucketName,
                Key: fileName,
                Body: file.stream(), // Use the file's stream for upload
                ContentType: file.type,
            };

            // Upload the file to S3 using the Upload class
            const upload = new Upload({
                client: s3,
                params: uploadParams,
            });

            // Wait for the upload to complete
            await upload.done();

            console.log("Upload successful:", { fileName });
            uploadedFiles.push(process.env.AWS_S3_BASE_URL+fileName); // Store the uploaded file name
        }

        // Return the file names or a success message
        return uploadedFiles;
    } catch (error) {
        //console.error("Error uploading files:", error);
        Sentry.captureException("Error uploading files:", error);
        return { error: "Error uploading files", details: error.message };
    }
}

export const uploadCompanyFilesToS3 = async (files) => {
    try {
        if (!files.length) {
            return "";
        }

        // Ensure the AWS bucket name is set
        const bucketName = process.env.AWS_BUCKET_NAME;
        if (!bucketName) {
            return "";
        }

        const uploadedFiles = []; // Array to hold names of uploaded files

        // Loop through each file and upload
        for (const file of files) {
            const fileName = `${uuidv4()}-${file.name}`;

            // Prepare the upload parameters
            const uploadParams = {
                Bucket: bucketName,
                Key: fileName,
                Body: file.stream(), // Use the file's stream for upload
                ContentType: file.type,
            };

            // Upload the file to S3 using the Upload class
            const upload = new Upload({
                client: s3,
                params: uploadParams,
            });

            // Wait for the upload to complete
            await upload.done();

            console.log("Upload successful:", { fileName });
            uploadedFiles.push(process.env.AWS_S3_BASE_URL+fileName); // Store the uploaded file name
        }

        // Return the file names or a success message
        return uploadedFiles[0];
    } catch (error) {
        //console.error("Error uploading files:", error);
        Sentry.captureException("Error uploading files:", error);
        return "";
    }
}

export const  uploadPortfolioFilesToS3 = async (files) => {
    try {
        if (!files.length) {
            return [];
        }

        // Ensure the AWS bucket name is set
        const bucketName = process.env.AWS_BUCKET_NAME;
        if (!bucketName) {
            return [];
        }

        const uploadedFiles = []; // Array to hold names of uploaded files

        // Loop through each file and upload
        for (const file of files) {
            const fileName = `${uuidv4()}-${file.name}`;

            // Prepare the upload parameters
            const uploadParams = {
                Bucket: bucketName,
                Key: fileName,
                Body: file.stream(), // Use the file's stream for upload
                ContentType: file.type,
            };

            // Upload the file to S3 using the Upload class
            const upload = new Upload({
                client: s3,
                params: uploadParams,
            });

            // Wait for the upload to complete
            await upload.done();

            console.log("Upload successful:", { fileName });
            uploadedFiles.push(process.env.AWS_S3_BASE_URL+fileName); // Store the uploaded file name
        }

        // Return the file names or a success message
        return uploadedFiles;
    } catch (error) {
        //console.error("Error uploading files:", error);
        Sentry.captureException("Error uploading files:", error);
        return [];
    }
}

export const getSignedUrlFromS3 = async (fileKey) => {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
        });

        // Generate the signed URL for the S3 object
        const url = await getSignedUrl(s3, command);

        // Return the signed URL
        return url;
    } catch (error) {
        //console.error('Error fetching image from S3:', error);
        Sentry.captureException('Error fetching image from S3:', error);

        // Return an error message
        return { error: 'Error fetching image from S3' };
    }
}

export const deleteFileFromS3 = async(fileName) => {
    try {
        if (!fileName) {
            return { error: "No file name provided" }; // Return early if no file name is provided
        }

        const key = new URL(fileName).pathname.substring(1);
        console.log("This key : "+key)


        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        };

        // Delete the file from S3
        const command = new DeleteObjectCommand(deleteParams);
        await s3.send(command);

        console.log("File deleted successfully:", fileName);
        return { message: "File deleted successfully" };
    } catch (error) {
        //console.error("Error deleting file:", error);
        Sentry.captureException("Error deleting file:", error);
        return { error: "Error deleting file", details: error.message };
    }
}


