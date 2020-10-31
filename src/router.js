
export class Router {
    
    constructor(){
        this.routes = [];
        this.default_routes = [];
    }
    
    add(uri, callback) {
        if(typeof uri === "string" && typeof callback === "function") {
            const route = {
                uri,
                callback,
            }
            this.routes.push(route);
        } else {
            console.error("Failed to register route.", uri, callback);
        }
    }
    
    default(callback) {
        if(typeof callback === "function") {
            this.default_routes.push(callback);
        } else {
            console.error("Failed to register default route.", callback);
        }
    }

    execute() {
        let run_default = true;
        this.routes.forEach(route => {
            const regEx = new RegExp(`^${route.uri}$`);
            let path;
            if (route.uri[0] === "#") {
                path = window.location.hash || "#/";
            } else {
                path = window.location.pathname || "/";
            }            
            const match = path.match(regEx);
            if(match){
                const req = { path, match }
                route.callback(req);
                run_default = false;
            }
        });
        if(run_default) {
            this.default_routes.forEach(callback => callback());
        }
    }

}

