class LinkRepair {
    constructor(options = {}) {
        this.contentSelector = options.contentSelector || 'main, article, .content';
        this.checkInterval = options.checkInterval || 5000;
        this.waybackApiUrl = 'https://archive.org/wayback/available';
        this.checkedLinks = new Set();
        this.init();
    }

    init() {
        // Create a style for visual feedback
        const style = document.createElement('style');
        style.textContent = `
            .link-checking { opacity: 0.7; }
            .link-repaired { background-color: #e6ffe6; }
            .link-failed { background-color: #ffe6e6; }
        `;
        document.head.appendChild(style);
        
        // Start checking links
        this.startLinkCheck();
    }

    async startLinkCheck() {
        const contentArea = document.querySelector(this.contentSelector);
        if (!contentArea) return;

        const links = contentArea.getElementsByTagName('a');
        
        for (const link of links) {
            if (this.checkedLinks.has(link.href)) continue;
            
            this.checkedLinks.add(link.href);
            await this.checkLink(link);
        }
    }

    async checkLink(link) {
        try {
            link.classList.add('link-checking');
            
            // First, try to fetch the URL directly
            const response = await fetch(link.href, { method: 'HEAD' });
            
            if (!response.ok) {
                // If the link is broken, try to get it from Wayback Machine
                const waybackUrl = await this.getWaybackUrl(link.href);
                
                if (waybackUrl) {
                    link.href = waybackUrl;
                    link.classList.add('link-repaired');
                    link.title = 'This link was automatically repaired using Wayback Machine';
                } else {
                    link.classList.add('link-failed');
                    link.title = 'This link appears to be broken and could not be repaired';
                }
            }
        } catch (error) {
            console.warn(`Error checking link ${link.href}:`, error);
            // Try Wayback Machine if the fetch fails
            const waybackUrl = await this.getWaybackUrl(link.href);
            if (waybackUrl) {
                link.href = waybackUrl;
                link.classList.add('link-repaired');
                link.title = 'This link was automatically repaired using Wayback Machine';
            } else {
                link.classList.add('link-failed');
                link.title = 'This link appears to be broken and could not be repaired';
            }
        } finally {
            link.classList.remove('link-checking');
        }
    }

    async getWaybackUrl(url) {
        try {
            const response = await fetch(`${this.waybackApiUrl}?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            
            if (data.archived_snapshots?.closest?.available) {
                return data.archived_snapshots.closest.url;
            }
            
            return null;
        } catch (error) {
            console.error('Error fetching from Wayback Machine:', error);
            return null;
        }
    }
}
