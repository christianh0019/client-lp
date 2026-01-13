
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
        if (!client.webhookUrl) {
            console.warn("LeadService: No Webhook URL configured for client", client.name);
            return false;
        }

        try {
            console.log("LeadService: Submitting lead...", { client: client.name, url: client.webhookUrl });

            const response = await fetch('/api/webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    targetUrl: client.webhookUrl,
                    payload: payload
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log("LeadService: Submission Successful", data);
            return true;

        } catch (error) {
            console.error("LeadService: Submission Failed", error);
            // We re-throw to allow UI to show error if needed, or return false
            throw error;
        }
    }
}
