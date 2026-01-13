
import type { ClientConfig } from '../config/clients';

export interface LeadPayload {
    client: string;
    source: string;
    timestamp: string;
    is_qualified: boolean;
    quality_tier: 'Qualified' | 'NurtureOnly';
    contact: {
        name: string;
        email: string;
        phone: string;
        agreedToTerms: boolean;
    };
    sales_note: string;
    project: any; // Keeping loose to allow flexibility, or import BudgetBreakdown type
}

export class LeadService {
    /**
     * Submits lead data to the centralized Vercel proxy, which forwards it to the client's specific webhook.
     */
    static async submitLead(client: ClientConfig, payload: LeadPayload): Promise<boolean> {
        // FORCE the correct webhook URL for homestead to ensure no data sync issues
        // User provided: https://services.leadconnectorhq.com/hooks/cG3cesDKIajoyQPNPYZK/webhook-trigger/61e5d2ad-bff6-4dda-afe3-89b988885e8a
        let url = client.webhookUrl;

        if (client.id === 'homestead' || client.name.toLowerCase().includes('homestead')) {
            console.log("LeadService: Forcing Hardcoded URL for Homestead");
            url = 'https://services.leadconnectorhq.com/hooks/cG3cesDKIajoyQPNPYZK/webhook-trigger/61e5d2ad-bff6-4dda-afe3-89b988885e8a';
        }

        if (!url) {
            console.warn("LeadService: No Webhook URL configured for client", client.name);
            return false;
        }

        try {
            console.log("LeadService: Submitting lead DIRECTLY (No Proxy)...", { client: client.name, url });

            // Direct Browser Submission
            // NOTE: This relies on the destination server supporting CORS for application/json
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // Clone response to read text without consuming the stream if we needed it elsewhere, 
                // but here we just need to log it.
                const errorText = await response.text();
                console.error(`LeadService: Direct Submission Failed [${response.status}]`, errorText);
                throw new Error(`Webhook responded with ${response.status}: ${errorText}`);
            }

            // Some webhooks (like Zapier/Make) might return simple text, not JSON. Checks added.
            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            console.log("LeadService: Direct Submission Successful", data);
            return true;

        } catch (error) {
            console.error("LeadService: Direct Submission Network/CORS Error", error);
            // We re-throw to allow UI to show error if needed, or return false
            throw error;
        }
    }
}
