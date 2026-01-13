export default async function handler(req, res) {
    // 1. CORS Headers (Allowing Client to Call)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // 2. Handle Preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 3. Parse Body (Robust handling for Vercel/Node)
    let body = req.body;
    // Vercel sometimes delivers body as string if content-type isn't matched
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid JSON Body', raw: body });
        }
    }

    // Safety check for empty body
    if (!body) {
        return res.status(400).json({ error: 'Empty Body Received' });
    }

    const { targetUrl, payload } = body;

    // 4. Validation
    if (!targetUrl) {
        return res.status(400).json({ error: 'Missing targetUrl', receivedBody: body });
    }

    try {
        console.log(`Proxying webhook to: ${targetUrl}`);

        // 5. Forward Request (Server-to-Server)
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // 6. Handle Response
        if (response.ok) {
            console.log('Webhook Proxy Success');
            return res.status(200).json({ success: true });
        } else {
            const text = await response.text();
            console.error('Webhook Proxy Failed:', response.status, text);
            return res.status(response.status).json({ error: `Upstream Error: ${response.status}`, details: text });
        }
    } catch (error) {
        console.error('Webhook Proxy Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
