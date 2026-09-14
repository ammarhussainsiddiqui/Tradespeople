"use server"
import { cookies } from "next/headers";
import * as Sentry from '@sentry/nextjs';
export async function getRequest(endpoint, token) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
            method: "GET",
            headers: {
                "Accept": "text/plain",
                "Authorization": `Bearer ${token}`,
            },
            cache: "no-cache",
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function postRequest(endpoint, body, token) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Accept": "text/plain",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        cache: "no-cache",
        body: JSON.stringify(body),
    });

    const data = await response.json();
    return data;
}

export async function deleteRequest(endpoint, body, token) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "DELETE",
        headers: {
            "Accept": "text/plain",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        cache: "no-cache",
        body: JSON.stringify(body),
    });

    const data = await response.json();
    return data;
}

export const fetchData = async (url) => {
    try {
        const token = cookies().get("jwt")?.value;

        if (!token) return;
        const response = await getRequest(url, token);
        let data = response.data.data;

        if (data.items) return data.items;
        return data;
    } catch (error) {
        //console.error(error);
        Sentry.captureException(error);
        return [];
    }
};
