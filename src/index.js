
import {Router} from "./router";

window.addEventListener('load', () => {
    const router = new Router();
    router.add('#/(edit(/.*)?)?', () => {
        console.log("edit");
    });
    router.add('#/view(/.*)?', () => {
        console.log("view");
    });
    router.default(() => {
        console.log("404");
    });
    router.execute();
});
