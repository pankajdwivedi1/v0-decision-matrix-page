import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

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
            const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);

            const messages = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Convert Firestore Timestamp to ISO string if needed, or keep as is if serializable
                    // Usually Firestore timestamps need conversion
                    timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp,
                };
            });

            return NextResponse.json({ success: true, messages });
        } catch (dbError: any) {
            console.error("Firestore Error:", dbError);
            // Fallback for when index is missing or rules deny access
            return NextResponse.json(
                { success: false, error: "Database access error. Please checks logs/rules." },
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
