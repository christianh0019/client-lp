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

        try {
            const records = await this.base('🤝 Clients').select({
                filterByFormula: `{Slug} = '${slug.toLowerCase()}'`,
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
            return records.map(this.mapRecordToConfig);
        } catch (error: any) {
            console.error("Error fetching all clients:", error);
            throw error;
        }
    }

    static async saveClient(client: ClientConfig): Promise<boolean> {
        if (!this.base) return false;

        try {
            // Check if exists to update, else create
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
        return {
            id: record.get('Slug'),
            name: record.get('Name'),
            webhookUrl: record.get('Webhook URL'),
            pixelId: record.get('Facebook Pixel ID'),
            bookingWidgetId: record.get('Booking Widget ID'),
            logo: record.get('Logo URL'),
            branding: {
                logo: record.get('Logo URL'),
                primaryColor: record.get('Primary Color')
            }
        };
    }
}
