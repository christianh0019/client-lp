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
    'homestead': {
        id: 'homestead',
        name: 'Homestead Home Builders',
        webhookUrl: 'https://services.leadconnectorhq.com/hooks/cG3cesDKIajoyQPNPYZK/webhook-trigger/61e5d2ad-bff6-4dda-afe3-89b988885e8a',
        pixelId: '672932955108158',
        bookingWidgetId: 'xPaYSZulboJxxCpHa9dY'
    },
    'verso': {
        id: 'verso',
        name: 'Verso Builders',
        webhookUrl: 'https://hook.us2.make.com/verso-webhook-id',
        pixelId: '9999999999',
        bookingWidgetId: 'verso-calendar-id'
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
