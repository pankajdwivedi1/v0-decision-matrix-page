import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { method, criteria, alternatives } = body;

        console.log(`Calculating ranking using method: ${method}`);

        // Map method names to API endpoints
        const methodMap: { [key: string]: string } = {
            'swei': '/api/calculate',
            'swi': '/api/calculate',
            'topsis': '/api/calculate',
            'vikor': '/api/calculate',
            'waspas': '/api/calculate',
            'edas': '/api/calculate',
            'moora': '/api/calculate',
            'multimoora': '/api/calculate',
            'todim': '/api/calculate',
            'codas': '/api/calculate',
            'moosra': '/api/calculate',
            'mairca': '/api/calculate',
            'mabac': '/api/calculate',
            'marcos': '/api/calculate',
            'cocoso': '/api/calculate',
            'copras': '/api/calculate',
            'promethee': '/api/calculate',
            'promethee1': '/api/calculate',
            'promethee2': '/api/calculate',
            'electre': '/api/calculate',
            'electre1': '/api/calculate',
            'electre2': '/api/calculate',
            'gra': '/api/calculate',
            'aras': '/api/calculate',
            'wsm': '/api/calculate',
            'wpm': '/api/calculate',
        };

        const apiEndpoint = methodMap[method];

        if (!apiEndpoint) {
            return NextResponse.json(
                { error: `Unknown ranking method: ${method}` },
                { status: 400 }
            );
        }

        // Call the ranking calculation API
        const baseUrl = request.nextUrl.origin;
        const response = await fetch(`${baseUrl}${apiEndpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                method: method,
                criteria,
                alternatives
            }),
        });

        if (!response.ok) {
            throw new Error(`API call to ${apiEndpoint} failed with status ${response.status}`);
        }

        const data = await response.json();

        // Return ranking results
        return NextResponse.json({
            ranking: data.ranking || [],
            method: method
        });

    } catch (error) {
        console.error('Ranking calculation error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate ranking', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
