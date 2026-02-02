import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        console.log('File received:', file.name, 'Type:', file.type, 'Size:', file.size);

        if (file.type !== 'application/pdf') {
            return NextResponse.json(
                { error: "File must be a PDF" },
                { status: 400 }
            );
        }

        try {
            // Convert file to buffer
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            console.log('Buffer created, size:', buffer.length);

            // CRITICAL FIX: Direct import from lib to bypass the buggy index.js test block
            // pdf-parse v1.1.1's index.js has a bug where it tries to run a test if module.parent is undefined
            // which is always true in Next.js environment.
            console.log('Parsing PDF using direct lib import...');

            const pdfParse = require('pdf-parse/lib/pdf-parse.js');

            const data = await pdfParse(buffer);

            const text = (data.text || '').trim();
            console.log('PDF parsed successfully. Pages:', data.numpages, 'Text length:', text.length);

            if (!text || text.length < 50) {
                return NextResponse.json(
                    { error: "No readable text found in PDF. The PDF may be scanned/image-based or encrypted." },
                    { status: 400 }
                );
            }

            return NextResponse.json({
                success: true,
                text: text,
                pages: data.numpages,
                message: `Successfully extracted ${data.numpages} pages`
            });

        } catch (pdfError: any) {
            console.error("PDF parsing internal error:", pdfError);
            return NextResponse.json(
                {
                    error: `PDF parsing failed: ${pdfError.message}`,
                    details: pdfError.message
                },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error("PDF extraction error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to extract PDF" },
            { status: 500 }
        );
    }
}
