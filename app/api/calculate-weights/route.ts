import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { method, criteria, alternatives } = body;

        console.log(`Calculating weights using method: ${method}`);

        // Map method names to API endpoints
        const methodMap: { [key: string]: string } = {
            'entropy': '/api/entropy-weights',
            'critic': '/api/critic-weights',
            'ahp': '/api/ahp-weights',
            'piprecia': '/api/piprecia-weights',
            'merec': '/api/merec-weights',
            'swara': '/api/swara-weights',
            'wenslo': '/api/wenslo-weights',
            'lopcow': '/api/lopcow-weights',
            'dematel': '/api/dematel-weights',
            'sd': '/api/sd-weights',
            'variance': '/api/variance-weights',
            'mad': '/api/mad-weights',
            'distance': '/api/distance-weights',
            'svp': '/api/svp-weights',
            'mdm': '/api/mdm-weights',
            'lsw': '/api/lsw-weights',
            'gpow': '/api/gpow-weights',
            'lpwm': '/api/lpwm-weights',
            'pcwm': '/api/pcwm-weights',
        };

        const apiEndpoint = methodMap[method];

        if (!apiEndpoint) {
            return NextResponse.json(
                { error: `Unknown weight method: ${method}` },
                { status: 400 }
            );
        }

        // Call the appropriate weight calculation API
        const baseUrl = request.nextUrl.origin;
        const response = await fetch(`${baseUrl}${apiEndpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ criteria, alternatives }),
        });

        if (!response.ok) {
            throw new Error(`API call to ${apiEndpoint} failed with status ${response.status}`);
        }

        const data = await response.json();

        // Return weights
        return NextResponse.json({
            weights: data.weights || {},
            method: method
        });

    } catch (error) {
        console.error('Weight calculation error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate weights', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
