// app/api/images/route.js
import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid"; // To generate unique file names
import { Upload } from '@aws-sdk/lib-storage';
import * as Sentry from '@sentry/nextjs';

// Initialize S3 client with credentials and region
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});

export async function GET() {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'cf54eac4-b443-459a-b96c-571fe246f5cf-Onboarding-2.png', // Replace with the actual path
        });

        // Generate the signed URL for the S3 object
        const url = await getSignedUrl(s3, command);

        // Return the signed URL as JSON response
        return NextResponse.json({ url });
    } catch (error) {
        Sentry.captureException('Error fetching image from S3:', error);

        // Return an error response using NextResponse
        return NextResponse.json({ error: 'Error fetching image from S3' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        // Read the file from the request
        const formData = await req.formData();
        const files = formData.getAll("file"); // Use getAll to retrieve multiple files

        if (!files.length) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        // Ensure the AWS bucket name is set
        const bucketName = process.env.AWS_BUCKET_NAME;
        if (!bucketName) {
            return NextResponse.json({ error: "AWS bucket name not configured" }, { status: 500 });
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
            uploadedFiles.push(fileName); // Store the uploaded file name
        }

        // Return the file names or a success message
        return NextResponse.json({ message: "Files uploaded successfully", uploadedFiles });
    } catch (error) {
        Sentry.captureException("Error uploading files:", error);
        return NextResponse.json({ error: "Error uploading files", details: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const fileName = searchParams.get("fileName"); // Get the file name from query parameters
        if (!fileName) {
            return NextResponse.json({ error: "No file name provided" }, { status: 400 });
        }

        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
        };

        // Delete the file from S3
        const command = new DeleteObjectCommand(deleteParams);
        await s3.send(command);

        return NextResponse.json({ message: "File deleted successfully" });
    } catch (error) {
        Sentry.captureException("Error deleting file:", error);
        return NextResponse.json({ error: "Error deleting file", details: error.message }, { status: 500 });
    }
}



