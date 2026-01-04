declare global {
    interface Window {
        fbq: any;
        _fbq: any;
    }
}

export const PixelService = {
    initialized: false,

    init: (pixelId: string) => {
        if (!pixelId) {
            console.warn('PixelService: No Pixel ID provided.');
            return;
        }

        if (window.fbq) {
            // Already initialized, just update ID if supporting multi-pixel (advanced)
            // For now, we assume one pixel per page load mostly, but we can init a specific one.
            window.fbq('init', pixelId);
            return;
        }

        // Standard Facebook Pixel Code
        const script = document.createElement('script');
        script.innerHTML = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
        `;
        document.head.appendChild(script);
        PixelService.initialized = true;
        console.log(`PixelService: Initialized ${pixelId}`);
    },

    track: (event: string, data?: any) => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', event, data);
            console.log(`PixelService: Tracked ${event}`, data);
        } else {
            console.warn(`PixelService: specific event ${event} not tracked (Pixel not loaded)`);
        }
    },

    trackCustom: (event: string, data?: any) => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('trackCustom', event, data);
            console.log(`PixelService: Tracked Custom ${event}`, data);
        }
    }
};
