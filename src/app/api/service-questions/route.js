import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();

export async function GET(request) {
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
        const url = new URL(request.url);
        const params = Object.fromEntries(url.searchParams.entries());
        const serviceId = parseInt(params.serviceId, 10); // Convert to integer

        if (!serviceId) {
            return NextResponse.json({
                success: false,
                message: 'Invalid service ID.',
            }, { status: 400 });
        }

        // Fetch questions associated with the service ID
        const questions = await prisma.servicesQuestion.findMany({
            where: {
                serviceId,
            },
        });

        return NextResponse.json({
            success: true,
            questions,
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}

export async function POST(request) {
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
        const { serviceId, question, answers } = await request.json();

        // Convert serviceId to an integer
        const parsedServiceId = parseInt(serviceId, 10);

        if (isNaN(parsedServiceId)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid service ID.',
            }, { status: 400 });
        }

        // Create new question associated with the service ID
        const newQuestion = await prisma.servicesQuestion.create({
            data: {
                serviceId: parsedServiceId, // Use the parsed integer here
                question,
                answers,
            },
        });

        return NextResponse.json({
            success: true,
            question: newQuestion,
        }, { status: 201 });

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}

export async function DELETE(request) {
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
        const url = new URL(request.url);
        const params = Object.fromEntries(url.searchParams.entries());
        const id = parseInt(params.id, 10); // Convert to integer

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'Invalid service question ID.',
            }, { status: 400 });
        }

        // Delete the service question by ID
        const deletedQuestion = await prisma.servicesQuestion.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Service question deleted successfully.',
            question: deletedQuestion,
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}
