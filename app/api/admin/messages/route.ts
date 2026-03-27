import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

const ADMIN_PASSWORD = "pankajdwivedi81";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        if (password !== ADMIN_PASSWORD) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        try {
            // Using Firebase Admin SDK (db is initialized in lib/firebase-admin.ts)
            const snapshot = await db.collection("messages").orderBy("timestamp", "desc").get();

            const messages = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp,
                };
            });

            return NextResponse.json({ success: true, messages });
        } catch (dbError: any) {
            console.error("Firestore Admin Error:", dbError);
            return NextResponse.json(
                { success: false, error: "Database error. Make sure you added credentials to .env" },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Admin API Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
