import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, nationality, message } = body;

        try {
            await db.collection("messages").add({
                name,
                email,
                nationality,
                message,
                timestamp: new Date(),
            });
        } catch (dbErr) {
            console.error("Firestore message log error:", dbErr);
        }

        return NextResponse.json({ success: true, message: "Message received" });
    } catch (error) {
        console.error("Contact Form Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
