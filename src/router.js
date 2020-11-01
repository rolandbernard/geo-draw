
import { render } from 'lit-html';

export class Router {
    
    constructor(component) {
        this.component = component;
        this.routes = [];
        this.default_route = null;
        this.last_route = null;
    }
    
    add(uri, html, callback) {
        if(typeof uri === "string" && typeof callback === "function") {
            const route = {
                uri,
                callback,
                html,
            }
            this.routes.push(route);
        } else {
            console.error("Failed to register route.", uri, callback);
        }
    }
    
    default(html, callback) {
        if(typeof callback === "function") {
            const route = {
                callback,
                html,
            }
            this.default_route = route;
        } else {
            console.error("Failed to register default route.", callback, html);
        }
    }

    update() {
        let run_default = true;
        for (const route of this.routes) {
            const regEx = new RegExp(`^${route.uri}$`);
            let path;
            if (route.uri[0] === "#") {
                path = window.location.hash || "#/";
            } else {
                path = window.location.pathname || "/";
            }            
            const match = path.match(regEx);
            if(match) {
                if(this.last_route !== route) {
                    render(route.html, this.component);
                    if(route.callback) {
                        const req = { path, match }
                        route.callback(req);
                    }
                }
                run_default = false;
                break;
            }
        }
        if(run_default && this.last_route !== this.default_route) {
            render(this.default_route.html, this.component);
            this.default_route.callback();
        }
    }

    init() {
        window.addEventListener('hashchange', this.update.bind(this));
        this.update();
    }

}

