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

    static async saveClient(_client: ClientConfig): Promise<boolean> {
        // Save logic is less critical for this fix but we keep it
        return false;
    }

    private static mapRecordToConfig(record: any): ClientConfig {
        // Dynamic Field Discovery: Scan all keys to find matches regardless of exact casing/spacing
        const fields = record.fields;
        const keys = Object.keys(fields);

        // Finder helpers - Case Insensitive Regex
        const findKey = (pattern: RegExp) => keys.find(k => pattern.test(k));

        // Resolve Keys
        const slugKey = findKey(/slug/i);
        const logoKey = findKey(/logo/i);
        const webhookKey = findKey(/webhook/i);
        const pixelKey = findKey(/pixel/i); // Matches 'Facebook Pixel ID' or 'Pixel ID'
        const bookingKey = findKey(/booking/i); // Matches 'Booking Widget ID'
        const colorKey = findKey(/color/i) || findKey(/primary/i);
        const nameKey = findKey(/name/i) || 'Name';

        // Extract Values
        const rawSlug = slugKey ? fields[slugKey] : null;
        const parsedSlug = AirtableService.getString(rawSlug);

        // Clean ID
        const cleanId = parsedSlug.replace(/^\//, '').replace(/^"|"$/g, '');

        // Fallback
        const isValid = cleanId && cleanId !== 'null' && !cleanId.startsWith('{');
        const finalId = isValid ? cleanId : record.id;

        const logoUrl = logoKey ? AirtableService.getString(fields[logoKey]) : '';
        const primaryColor = colorKey ? AirtableService.getString(fields[colorKey]) : '';

        return {
            id: finalId,
            name: AirtableService.getString(fields[nameKey]) || 'Unnamed Client',
            webhookUrl: webhookKey ? AirtableService.getString(fields[webhookKey]) : '',
            pixelId: pixelKey ? AirtableService.getString(fields[pixelKey]) : '',
            bookingWidgetId: bookingKey ? AirtableService.getString(fields[bookingKey]) : '',
            logo: logoUrl,
            branding: {
                logo: logoUrl,
                primaryColor: primaryColor
            }
        };
    }

    // Helper to safely extract string from various Airtable field types
    private static getString(value: any): string {
        if (value === null || value === undefined) return '';

        // Recursively handle arrays (Lookups, Rollups)
        if (Array.isArray(value)) {
            return value.length > 0 ? AirtableService.getString(value[0]) : '';
        }

        // Handle Objects (Attachments, Linked Records)
        if (typeof value === 'object') {
            // Attachments have .url
            if (value.url) return value.url;
            // Linked records have .name or .text
            if (value.name) return value.name;

            // Debugging: Return JSON if unknown object
            try { return JSON.stringify(value); } catch { return String(value); }
        }

        return String(value);
    }
}
