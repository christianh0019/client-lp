import Airtable from 'airtable';
import type { ClientConfig } from '../config/clients';
import { AIRTABLE_CONSTANTS } from '../config/constants';

const ENV_API_KEY = import.meta.env.VITE_AIRTABLE_TOKEN;

export class AirtableService {
    private static base: Airtable.Base;

    // Allow dynamic initialization 
    static init(baseId: string = AIRTABLE_CONSTANTS.BASE_ID, apiKey: string = ENV_API_KEY) {
        if (!apiKey) {
            console.error("Airtable Token Missing");
            this.base = undefined as any;
            return;
        }
        if (!baseId) {
            console.error("Airtable Base ID Missing");
            this.base = undefined as any;
            return;
        }
        this.base = new Airtable({ apiKey: apiKey }).base(baseId);
    }

    static async getClientBySlug(slug: string): Promise<ClientConfig | null> {
        if (!this.base) return null;

        const clean = slug.toLowerCase();
        // Match "slug" OR "/slug" to support Airtable values like "/homestead"
        const formula = `OR({Slug} = '${clean}', {Slug} = '/${clean}')`;

        try {
            const records = await this.base('🤝 Clients').select({
                filterByFormula: formula,
                maxRecords: 1
            }).firstPage();

            if (records.length === 0) return null;

            return this.mapRecordToConfig(records[0]);
        } catch (error) {
            console.error("Error fetching client from Airtable:", error);
            return null;
        }
    }

    static async getAllClients(): Promise<ClientConfig[]> {
        if (!this.base) throw new Error("Base not initialized");

        try {
            const records = await this.base('🤝 Clients').select().all();
            return records.map(record => this.mapRecordToConfig(record));
        } catch (error: any) {
            console.error("Error fetching all clients:", error);
            throw error;
        }
    }

    static async saveClient(client: ClientConfig): Promise<boolean> {
        if (!this.base) return false;

        try {
            // Check if exists to update, else create
            // Note: Saving might fail if slug format doesn't match, but Admin is read-only now basically.
            const records = await this.base('🤝 Clients').select({
                filterByFormula: `{Slug} = '${client.id.toLowerCase()}'`,
                maxRecords: 1
            }).firstPage();

            const fields = {
                'Slug': client.id.toLowerCase(),
                'Name': client.name,
                'Webhook URL': client.webhookUrl,
                'Facebook Pixel ID': client.pixelId,
                'Booking Widget ID': client.bookingWidgetId,
                'Logo URL': client.logo || '',
                'Primary Color': client.branding?.primaryColor || ''
            };

            if (records.length > 0) {
                await this.base('🤝 Clients').update(records[0].id, fields);
            } else {
                await this.base('🤝 Clients').create(fields);
            }
            return true;
        } catch (error) {
            console.error("Error saving client:", error);
            return false;
        }
    }

    private static mapRecordToConfig(record: any): ClientConfig {
        const rawSlug = AirtableService.getString(record.get('Slug'));
        const cleanId = rawSlug.replace(/^\//, ''); // Remove leading slash if present

        // Use parsed slug, or fallback to record ID if empty
        const finalId = cleanId || record.id;

        // Use helper for safe extraction
        const logoUrl = AirtableService.getString(record.get('Logo URL'));
        const primaryColor = AirtableService.getString(record.get('Primary Color'));

        return {
            id: finalId,
            name: AirtableService.getString(record.get('Name')) || 'Unnamed Client',
            webhookUrl: AirtableService.getString(record.get('Webhook URL')),
            pixelId: AirtableService.getString(record.get('Facebook Pixel ID')),
            bookingWidgetId: AirtableService.getString(record.get('Booking Widget ID')),
            logo: logoUrl,
            branding: {
                logo: logoUrl,
                primaryColor: primaryColor
            }
        };
    }

    // Helper to safely extract string from various Airtable field types
    private static getString(value: any): string {
        if (!value) return '';

        // Recursively handle arrays (Lookups, Rollups)
        if (Array.isArray(value)) {
            return AirtableService.getString(value[0]);
        }

        // Handle Objects (Attachments, Linked Records)
        if (typeof value === 'object') {
            // Attachments have .url
            if (value.url) return value.url;
            // Linked records have .name or .text
            if (value.name) return value.name;
            // Fallback: try string conversion but avoid [object Object] if possible
            return '';
        }

        return String(value);
    }
}
