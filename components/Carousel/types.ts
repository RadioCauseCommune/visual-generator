export type SlideTheme = 'vanilla' | 'white' | 'dark';
export type BadgeColor = 'red' | 'yellow' | 'green' | 'white' | 'dark';
export type SlideLayout = 'cover' | 'stats' | 'badges' | 'bullets' | 'quote' | 'cta';

export interface StatItem {
  id: string;
  number: string;
  label: string;
  sub: string;
  style: 'white' | 'accent' | 'dark';
}

export interface MicroBadgeItem {
  id: string;
  badge: string;
  badgeColor: BadgeColor;
  text: string;
}

export interface CarouselSlide {
  id: string;
  layout: SlideLayout;
  theme: SlideTheme;
  badgeText: string;
  badgeColor: BadgeColor;
  footerText?: string;
  
  // Cover
  coverTitle?: string;
  coverHighlight?: string;
  coverSubtitle?: string;
  coverDescription?: string;

  // Stats (2x2 grid)
  statsTitle?: string;
  stats?: StatItem[];

  // Badges list
  badgesTitle?: string;
  badgeItems?: MicroBadgeItem[];

  // Bullet points
  bulletsTitle?: string;
  leadText?: string;
  bullets?: string[];

  // Quote
  quoteText?: string;
  quoteAuthor?: string;
  quoteRole?: string;

  // CTA
  ctaTitle?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaButtonColor?: 'red' | 'green' | 'yellow';
  ctaSubtext?: string;
}

export interface CarouselProject {
  id: string;
  title: string;
  defaultFooterMedia: string;
  slides: CarouselSlide[];
}
