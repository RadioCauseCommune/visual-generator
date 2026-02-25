export interface RssEpisode {
    id: string;
    title: string;
    number: string;
    link: string;
    pubDate: string;
    description: string;
    imageUrl: string;
    enclosureUrl: string;
    duration: string;
}

export interface RssFeedInfo {
    title: string;
    description: string;
    episodes: RssEpisode[];
}

export interface WpEmission {
    id: number;
    title: { rendered: string };
    slug: string;
    acf?: {
        subtitle?: string;
    };
}

const API_ROOT = 'https://cause-commune.fm/wp-json/wp/v2';

const unescapeHtml = (safe: string) => {
    if (!safe) return "";
    const doc = new DOMParser().parseFromString(safe, "text/html");
    return doc.documentElement.textContent || safe;
};

export const fetchEmissions = async (): Promise<WpEmission[]> => {
    const url = `${API_ROOT}/emissions?per_page=100&_fields=id,title,slug,acf`;
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;

    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("Impossible de charger les émissions");
    const data: WpEmission[] = await response.json();
    return data.map(e => ({
        ...e,
        title: { rendered: unescapeHtml(e.title.rendered) }
    }));
};

export const fetchAndParseRss = async (url: string): Promise<RssFeedInfo> => {
    // For local dev, we use our proxy if configured
    const targetUrl = url.startsWith('http') ? `/api/proxy?url=${encodeURIComponent(url)}` : url;

    const response = await fetch(targetUrl);
    if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du flux: ${response.statusText}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const channel = xmlDoc.querySelector("channel");
    if (!channel) throw new Error("Flux RSS invalide (pas de channel)");

    const feedInfo: RssFeedInfo = {
        title: channel.querySelector("title")?.textContent || "Sans titre",
        description: channel.querySelector("description")?.textContent || "",
        episodes: []
    };

    const items = xmlDoc.querySelectorAll("item");
    items.forEach(item => {
        const title = item.querySelector("title")?.textContent || "";

        // Extract episode number (e.g., "#264" or "264")
        const numberMatch = title.match(/#(\d+)/) || title.match(/^(\d+)/);
        const number = numberMatch ? numberMatch[1] : "";

        // Extract iTunes image
        const itunesImage = item.getElementsByTagName("itunes:image")[0] || item.querySelector("itunes\\:image");
        const imageUrl = itunesImage?.getAttribute("href") || "";

        // Extract enclosure
        const enclosure = item.querySelector("enclosure");
        const enclosureUrl = enclosure?.getAttribute("url") || "";

        // Extract iTunes duration
        const itunesDuration = item.getElementsByTagName("itunes:duration")[0] || item.querySelector("itunes\\:duration");
        const duration = itunesDuration?.textContent || "";

        feedInfo.episodes.push({
            id: item.querySelector("guid")?.textContent || Math.random().toString(36).substr(2, 9),
            title: unescapeHtml(title.replace(/^[#\d\s–-]+/, '').trim()), // Clean title
            number: number,
            link: item.querySelector("link")?.textContent || "",
            pubDate: item.querySelector("pubDate")?.textContent || "",
            description: unescapeHtml(item.querySelector("description")?.textContent || ""),
            imageUrl: imageUrl,
            enclosureUrl: enclosureUrl,
            duration: duration
        });
    });

    return feedInfo;
};
