import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import {uploadFilesToS3 , deleteFileFromS3} from "../../../utils/imageUploads";
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();

export async function PUT(request) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];
    const authResult = await authenticateToken(token);
    
    if (authResult.error) {
        return NextResponse.json({
          success: false,
          message: authResult.error,
        }, { status: authResult.status });
    }
    try {
        const formData = await request.formData();
        const id = formData.get("id");
        const firstName = formData.get("firstName");
        const lastName = formData.get("lastName");
        const profileUrl = formData.get("profileUrl");
        const introduction = formData.get("introduction");
        const file = formData.getAll("file");
        const gender = formData.get("gender")

     
        // const body = await request;
        // const { id, firstName, lastName, profileUrl, introduction} = body;

        

        // Validate input
        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'User ID is required',
            }, { status: 400 });
        }

        // Find the user by ID
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
        });

        let uploadedImage = null;
        if(file.length > 0){
         uploadedImage = await uploadFilesToS3(file);
         const deletePreviousImage = await deleteFileFromS3(user?.profileUrl);
        }

        // if(uploadedImage){
           
        // }

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'User not found',
            }, { status: 404 });
        }

        // Update user fields
        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: {
                firstName: firstName || user.firstName,
                lastName: lastName || user.lastName,
                profileUrl: uploadedImage !== null ? uploadedImage[0] : user.profileUrl,
                introduction: introduction || user.introduction,
                gender: gender || "Male"
            },
        });

        return NextResponse.json({
            success: true,
            data: updatedUser,
        }, { status: 200 });
    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}
