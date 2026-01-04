export interface ClientConfig {
    id: string;
    name: string;
    webhookUrl: string;
    pixelId: string;
    bookingWidgetId: string; // To allow unique calendars per client
    branding?: {
        logo?: string;
        primaryColor?: string;
    };
}

export const CLIENTS: Record<string, ClientConfig> = {
    'demo': {
        id: 'demo',
        name: 'BuilderProject Demo',
        webhookUrl: 'https://hook.us2.make.com/your-default-webhook', // Replace with actual default or placeholder
        pixelId: '', // Empty initially, handled safely
        bookingWidgetId: 'xPaYSZulboJxxCpHa9dY' // Default Widget ID
    },
    // Example for a new client:
    // 'apex-builders': {
    //     id: 'apex-builders',
    //     name: 'Apex Custom Builders',
    //     webhookUrl: '...',
    //     pixelId: '123456789',
    //     bookingWidgetId: '...'
    // }
};

export const DEFAULT_CLIENT_SLUG = 'demo';

export const getClientConfig = (slug?: string): ClientConfig => {
    if (!slug) return CLIENTS[DEFAULT_CLIENT_SLUG];
    const normalizedSlug = slug.toLowerCase();
    return CLIENTS[normalizedSlug] || CLIENTS[DEFAULT_CLIENT_SLUG];
};
