export default async function handler(req, res) {
    // 1. CORS Headers (Allowing Client to Call)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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

    try {
        // 3. Parse Body
        const body = req.body;

        // Vercel/Next.js body parsing check
        const { targetUrl, payload } = typeof body === 'string' ? JSON.parse(body) : body;

        // 4. Validation
        if (!targetUrl) {
            return res.status(400).json({ error: 'Missing targetUrl' });
        }
        if (!payload) {
            return res.status(400).json({ error: 'Missing payload' });
        }

        console.log(`[Proxy] Forwarding to: ${targetUrl}`);

        // 5. Forward Request
        // Add a timeout signal to prevent hanging indefinitely
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000); // 9s timeout (Vercel limit is 10s usually)

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'BuilderProject-Proxy/1.0'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // 6. Handle Response
        if (response.ok) {
            // Try to parse JSON response from webhook, but don't fail if it's not JSON
            const text = await response.text();
            let data;
            try { data = JSON.parse(text); } catch { data = { message: text }; }

            console.log('[Proxy] Success:', data);
            return res.status(200).json({ success: true, upstream: data });
        } else {
            const text = await response.text();
            console.error('[Proxy] Upstream Error:', response.status, text);
            return res.status(502).json({ error: `Upstream Webhook Failed: ${response.status}`, details: text });
        }

    } catch (error) {
        console.error('[Proxy] Internal Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
