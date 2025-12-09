import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { k } = await req.json();
    if (!Array.isArray(k)) return NextResponse.json({ error: "k must be array" }, { status: 400 });
    // compute
    const compute = (kArray: number[]) => {
        const n = kArray.length + 1;
        const s = [1];
        for (let j = 2; j <= n; j++) s.push(1 / (1 + kArray[j - 2]));
        const q: number[] = [];
        q[0] = s[0];
        for (let j = 1; j < s.length; j++) q[j] = q[j - 1] * s[j];
        const Q = q.reduce((a, b) => a + b, 0);
        const w = q.map((v) => v / Q);
        return { s, q, Q, w };
    };
    const result = compute(k);
    return NextResponse.json({ ...result, latex: `w=[${result.w.map(x => x.toFixed(4)).join(", ")}]` });
}
