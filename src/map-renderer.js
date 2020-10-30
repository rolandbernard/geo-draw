
import { LitElement, html, svg } from 'lit-element';
import { until } from 'lit-html/directives/until';

class MapRenderer extends LitElement {

    static get properties() {
        return {
            data: { type: Object },
        };
    }

    static parseBinaryData(array_buffer) {
        const uint8_array = new Uint8Array(array_buffer);
        let len = 0;
        while(uint8_array[len] != 0) {
            len++;
        }
        const string_part = new Uint8Array(array_buffer, 0, len);
        const utf8_decoder = new TextDecoder();
        const data_view = new DataView(array_buffer, len + 1);
        len = 0;
        const coords = [];
        const num_poly = data_view.getUint32(len, true);
        len += 4;
        for (let p = 0; p < num_poly; p++) {
            coords.push([]);
            const num_path = data_view.getUint32(len, true);
            len += 4;
            for (let t = 0; t < num_path; t++) {
                coords[p].push([]);
                const num_cords = data_view.getUint32(len, true);
                len += 4;
                for (let c = 0; c < num_cords; c++) {
                    const lon = data_view.getUint32(len, true);
                    len += 4;
                    const lat = data_view.getUint32(len, true);
                    len += 4;
                    coords[p][t].push([lon, lat]);
                }
            }
        }
        return {
            name: utf8_decoder.decode(string_part),
            coords: coords,
        };
    }

    static project([lon, lat]) {
        return [
            (Math.PI + (lon * Math.PI / 180)),
            (
                Math.abs(lat) > 89.5
                    ? Math.sign(lat) * 89.5
                    : (() => {
                        const phi = lat * Math.PI / 180;
                        return Math.PI - Math.log(Math.tan(Math.PI / 4 + phi / 2));
                    })()
            )
        ];
    }

    async drawMap() {
        console.log(this.data);
        if(this.data?.locations) {
            const locations_promise = Promise.all(this.data.locations.map(async location => {
                const res = await fetch(`/static/data/${location}.bin`);
                const data = MapRenderer.parseBinaryData(await res.arrayBuffer());
                data.coords = data.coords.map(poly => poly.map(part => part.map(([lon, lat]) => MapRenderer.project([lon / 1e7, lat / 1e7]))));
                return {
                    name: data.name,
                    min: data.coords.flat(2).reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1])]),
                    max: data.coords.flat(2).reduce((a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1])]),
                    svg: data.coords.map(poly => (
                        svg`<path d=${
                            poly.map((part, i) => (
                                (i == 0 ? part : part.reverse())
                                    .map((coord, i) => (
                                        i == 0
                                            ? "M" + coord[0] + " " + coord[1]
                                            : "L" + coord[0] + " " + coord[1]
                                    )).join(' ')
                            )).join(' ')
                        }/>`
                    )),
                };
            }));

            const locations = await locations_promise;
            const min = locations.map(loc => loc.min).reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1])]);
            const max = locations.map(loc => loc.max).reduce((a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1])]);
            console.log(locations);
            return html`
                <svg viewBox=${min[0] + " " + min[1] + " " + (max[0] - min[0]) + " " + (max[1] - min[1])}>
                    ${locations.map(loc => svg`<g>${loc.svg}</g>`)}
                </svg>
            `;
        } else {
            return html`<div>No data</div>`
        }
    }

    render() {
        return html`
            <style></style>
            <div>
                ${until(this.drawMap(), "Loading...")}
            </div>
        `;
    }

}

customElements.define('map-renderer', MapRenderer);
