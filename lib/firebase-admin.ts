// Edge-compatible Firestore wrapper that avoids heavy Node.js gRPC and protobufjs libraries
// which cause "Code generation from strings disallowed for this context" (EvalError) in Cloudflare Workers.

export interface FirestoreDoc {
    id: string;
    data: () => Record<string, any>;
}

export interface FirestoreQuerySnapshot {
    docs: FirestoreDoc[];
}

class EdgeCollection {
    private collectionName: string;

    constructor(collectionName: string) {
        this.collectionName = collectionName;
    }

    async add(data: Record<string, any>): Promise<{ id: string }> {
        const projectId = process.env.FIREBASE_PROJECT_ID || "decisionalgo-36e5c";
        try {
            // Use Firestore REST API v1
            const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${this.collectionName}`;
            // Convert simple JS object to Firestore REST fields format
            const fields: Record<string, any> = {};
            for (const [key, val] of Object.entries(data)) {
                if (val === undefined || val === null) continue;
                if (typeof val === "string") fields[key] = { stringValue: val };
                else if (typeof val === "number") fields[key] = { doubleValue: val };
                else if (typeof val === "boolean") fields[key] = { booleanValue: val };
                else if (val instanceof Date) fields[key] = { timestampValue: val.toISOString() };
                else fields[key] = { stringValue: String(val) };
            }

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fields }),
            });
            if (res.ok) {
                const json = await res.json();
                const id = json.name ? json.name.split("/").pop() : "ok";
                return { id };
            }
        } catch {
            // Silently fallback if network / REST unavailable
        }
        return { id: "offline" };
    }

    orderBy(_field: string, _dir?: string) {
        return this;
    }

    async get(): Promise<FirestoreQuerySnapshot> {
        const projectId = process.env.FIREBASE_PROJECT_ID || "decisionalgo-36e5c";
        try {
            const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${this.collectionName}`;
            const res = await fetch(url);
            if (res.ok) {
                const json = await res.json();
                const documents = json.documents || [];
                const docs: FirestoreDoc[] = documents.map((doc: any) => {
                    const id = doc.name ? doc.name.split("/").pop() : "";
                    const dataObj: Record<string, any> = {};
                    if (doc.fields) {
                        for (const [k, v] of Object.entries(doc.fields as Record<string, any>)) {
                            if (v.stringValue !== undefined) dataObj[k] = v.stringValue;
                            else if (v.integerValue !== undefined) dataObj[k] = parseInt(v.integerValue, 10);
                            else if (v.doubleValue !== undefined) dataObj[k] = parseFloat(v.doubleValue);
                            else if (v.booleanValue !== undefined) dataObj[k] = v.booleanValue;
                            else if (v.timestampValue !== undefined) dataObj[k] = v.timestampValue;
                            else dataObj[k] = Object.values(v)[0];
                        }
                    }
                    return {
                        id,
                        data: () => dataObj,
                    };
                });
                return { docs };
            }
        } catch {
            // Fallback
        }
        return { docs: [] };
    }
}

export const db = {
    collection(name: string) {
        return new EdgeCollection(name);
    },
} as any;
