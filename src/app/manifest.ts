import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'TechAssist Pro - ctrlOS',
        short_name: 'ctrlOS',
        description: 'Sistema de Controle de Ordens de Serviço',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/globe.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
        ],
    };
}
