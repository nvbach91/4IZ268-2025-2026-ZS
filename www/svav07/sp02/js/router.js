/**
 * Router Module
 * Handles hash-based navigation logic.
 */

export class Router {
    constructor(routes) {
        this.routes = routes;
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute(); // Initial load
    }

    handleRoute() {
        let hash = window.location.hash.slice(1);
        if (!hash) {
            hash = 'dashboard';
        }

        // Simple param support: discover/search -> [discover, search]
        const [route, ...args] = hash.split('/');

        // Update Active Nav Link
        document.querySelectorAll('.nav-link').forEach(link => {
            const linkRoute = link.getAttribute('data-route');
            if (linkRoute === route) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Execute View
        const handler = this.routes[route];
        if (handler) {
            handler(...args);
        } else {
            // Fallback
            window.location.hash = 'dashboard';
        }

        window.scrollTo(0, 0);
    }

    static navigate(path) {
        window.location.hash = path;
    }
}
