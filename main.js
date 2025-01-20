class LinkRepair {
    constructor(options = {}) {
        this.contentSelector = options.contentSelector || 'main, article, .content';
        this.checkInterval = options.checkInterval || 5000;
        this.verbose = options.verbose || false;
        this.waybackApiUrl = 'https://archive.org/wayback/available';
        this.checkedLinks = new Set();
        
        this.log('LinkRepair initialized with options:', {
            contentSelector: this.contentSelector,
            checkInterval: this.checkInterval,
            verbose: this.verbose
        });
        
        this.init();
    }

    log(...args) {
        if (this.verbose) {
            console.log('[LinkRepair]', ...args);
        }
    }

    warn(...args) {
        if (this.verbose) {
            console.warn('[LinkRepair]', ...args);
        }
    }

    error(...args) {
        if (this.verbose) {
            console.error('[LinkRepair]', ...args);
        }
    }

    init() {
        this.log('Initializing LinkRepair...');
        
        // Create a style for visual feedback
        const style = document.createElement('style');
        style.textContent = `
            .link-checking { opacity: 0.7; }
            .link-repaired { background-color: #e6ffe6; }
            .link-failed { background-color: #ffe6e6; }
        `;
        document.head.appendChild(style);
        this.log('Styles injected');
        
        // Start checking links
        this.startLinkCheck();
        this.log('Initial link check started');
    }

    async startLinkCheck() {
        const contentArea = document.querySelector(this.contentSelector);
        if (!contentArea) {
            this.warn('Content area not found with selector:', this.contentSelector);
            return;
        }

        const links = contentArea.getElementsByTagName('a');
        this.log(`Found ${links.length} links to check`);
        
        for (const link of links) {
            if (this.checkedLinks.has(link.href)) {
                this.log(`Skipping already checked link: ${link.href}`);
                continue;
            }
            
            this.checkedLinks.add(link.href);
            this.log(`Checking link: ${link.href}`);
            await this.checkLink(link);
        }
    }

    async checkLink(link) {
        try {
            link.classList.add('link-checking');
            this.log(`Testing link: ${link.href}`);
            
            // First, try to fetch the URL directly
            const response = await fetch(link.href, { method: 'HEAD' });
            
            if (!response.ok) {
                this.warn(`Link returned ${response.status}: ${link.href}`);
                // If the link is broken, try to get it from Wayback Machine
                const waybackUrl = await this.getWaybackUrl(link.href);
                
                if (waybackUrl) {
                    this.log(`Found Wayback Machine version: ${waybackUrl}`);
                    link.href = waybackUrl;
                    link.classList.add('link-repaired');
                    link.title = 'This link was automatically repaired using Wayback Machine';
                } else {
                    this.error(`No Wayback Machine version found for: ${link.href}`);
                    link.classList.add('link-failed');
                    link.title = 'This link appears to be broken and could not be repaired';
                }
            } else {
                this.log(`Link is healthy: ${link.href}`);
            }
        } catch (error) {
            this.error(`Error checking link ${link.href}:`, error);
            // Try Wayback Machine if the fetch fails
            const waybackUrl = await this.getWaybackUrl(link.href);
            if (waybackUrl) {
                this.log(`Found Wayback Machine version after error: ${waybackUrl}`);
                link.href = waybackUrl;
                link.classList.add('link-repaired');
                link.title = 'This link was automatically repaired using Wayback Machine';
            } else {
                this.error(`Failed to repair broken link: ${link.href}`);
                link.classList.add('link-failed');
                link.title = 'This link appears to be broken and could not be repaired';
            }
        } finally {
            link.classList.remove('link-checking');
        }
    }

    async getWaybackUrl(url) {
        this.log(`Checking Wayback Machine for: ${url}`);
        try {
            const response = await fetch(`${this.waybackApiUrl}?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            
            if (data.archived_snapshots?.closest?.available) {
                this.log(`Found Wayback Machine snapshot: ${data.archived_snapshots.closest.url}`);
                return data.archived_snapshots.closest.url;
            }
            
            this.warn(`No Wayback Machine snapshot available for: ${url}`);
            return null;
        } catch (error) {
            this.error('Error fetching from Wayback Machine:', error);
            return null;
        }
    }
}

// Auto-initialize with default options if the script is loaded directly
if (typeof window !== 'undefined') {
    window.LinkRepair = LinkRepair;
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[LinkRepair] Script loaded and ready');
        new LinkRepair({ verbose: false });
    });
}

// For module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LinkRepair;
}
