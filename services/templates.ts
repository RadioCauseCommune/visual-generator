
import { AssetType, Layer, LayerRole } from '../types';
import { DIMENSIONS, LOGOS, COLORS } from '../constants';

export interface Template {
    id: string;
    label: string;
    description: string;
    getLayers: (assetType: AssetType, meta: any) => Layer[];
}

export const TEMPLATES: Template[] = [
    {
        id: 'standard',
        label: 'Standard',
        description: 'Mise en page classique avec logo, titre et sous-titre.',
        getLayers: (assetType, meta) => {
            const { w, h } = DIMENSIONS[assetType];
            const logoSize = Math.max(100, Math.min(w * 0.1, 400));
            return [
                {
                    id: 'logo-1', role: 'logo', type: 'logo', content: LOGOS.nb,
                    x: 40, y: 40, width: logoSize, height: logoSize, zIndex: 10, rotation: 0
                },
                {
                    id: 'title-1', role: 'title', type: 'text', content: meta.title,
                    x: 40, y: h / 2 - 100, width: w - 80, height: 200,
                    fontSize: assetType === AssetType.PODCAST_COVER ? 180 : 80,
                    color: COLORS.WHITE, fontFamily: 'Syne', zIndex: 5, rotation: -2, hasScratch: true, scratchColor: COLORS.BLACK
                },
                {
                    id: 'sub-1', role: 'subtitle', type: 'text', content: meta.subtitle,
                    x: 42, y: h / 2 + 100, width: w - 100, height: 100,
                    fontSize: assetType === AssetType.PODCAST_COVER ? 80 : 40,
                    color: COLORS.ACID_GREEN, fontFamily: 'Roboto Condensed', zIndex: 6, rotation: 0
                },
                {
                    id: 'bg-1', role: 'background', type: 'image', content: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80',
                    x: 0, y: 0, width: w, height: h, zIndex: 0, rotation: 0, overlayColor: COLORS.BLACK, overlayOpacity: 40
                }
            ];
        }
    },
    {
        id: 'interview',
        label: 'Interview',
        description: 'Template dédié aux entretiens avec mise en avant de l\'invité.',
        getLayers: (assetType, meta) => {
            const { w, h } = DIMENSIONS[assetType];
            const logoSize = Math.max(100, Math.min(w * 0.08, 300));
            return [
                {
                    id: 'logo-1', role: 'logo', type: 'logo', content: LOGOS.nb,
                    x: w - logoSize - 40, y: 40, width: logoSize, height: logoSize, zIndex: 10, rotation: 0
                },
                {
                    id: 'guest-img-1', role: 'guest_photo', type: 'image', content: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
                    x: 40, y: 40, width: w * 0.4, height: h * 0.5, zIndex: 1, rotation: 0, clipShape: 'circle'
                },
                {
                    id: 'guest-name-1', role: 'guest_name', type: 'text', content: meta.guest_name || 'NOM DE L\'INVITÉ',
                    x: 40, y: h * 0.6, width: w - 80, height: 100,
                    fontSize: 60, color: COLORS.BLACK, fontFamily: 'Syne', zIndex: 8, rotation: 2, hasScratch: true, scratchColor: COLORS.ACID_GREEN
                },
                {
                    id: 'title-1', role: 'title', type: 'text', content: meta.title,
                    x: 40, y: h * 0.75, width: w - 80, height: 150,
                    fontSize: 100, color: COLORS.WHITE, fontFamily: 'Archivo Black', zIndex: 5, rotation: 0
                }
            ];
        }
    },
    {
        id: 'debat',
        label: 'Débat / Table Ronde',
        description: 'Style dynamique pour les émissions de discussion.',
        getLayers: (assetType, meta) => {
            const { w, h } = DIMENSIONS[assetType];
            return [
                {
                    id: 'title-1', role: 'title', type: 'text', content: meta.title,
                    x: 0, y: 100, width: w, height: 200,
                    fontSize: 120, color: COLORS.BLACK, fontFamily: 'Anton', zIndex: 5, rotation: 0,
                    hasScratch: true, scratchColor: COLORS.RED
                },
                {
                    id: 'sub-1', role: 'subtitle', type: 'text', content: meta.subtitle,
                    x: 0, y: 350, width: w, height: 80,
                    fontSize: 40, color: COLORS.WHITE, fontFamily: 'Space Grotesk', zIndex: 6, rotation: 0,
                    hasScratch: true, scratchColor: COLORS.BLACK
                },
                {
                    id: 'logo-1', role: 'logo', type: 'logo', content: LOGOS.nb,
                    x: w / 2 - 50, y: h - 150, width: 100, height: 100, zIndex: 10, rotation: 0
                }
            ];
        }
    },
    {
        id: 'chronique',
        label: 'Chronique',
        description: 'Template minimaliste et élégant pour les segments courts.',
        getLayers: (assetType, meta) => {
            const { w, h } = DIMENSIONS[assetType];
            return [
                {
                    id: 'logo-1', role: 'logo', type: 'logo', content: LOGOS.nb,
                    x: 20, y: 20, width: 80, height: 80, zIndex: 10, rotation: 0
                },
                {
                    id: 'title-1', role: 'title', type: 'text', content: meta.title,
                    x: 120, y: 30, width: w - 140, height: 60,
                    fontSize: 30, color: COLORS.BLACK, fontFamily: 'Lexend Zetta', zIndex: 5, rotation: 0
                },
                {
                    id: 'line-1', role: 'manual', type: 'text', content: '____________________________________________________________________',
                    x: 40, y: 110, width: w - 80, height: 10, fontSize: 20, color: COLORS.RED, fontFamily: 'Roboto Condensed', zIndex: 4, rotation: 0
                }
            ];
        }
    }
];
