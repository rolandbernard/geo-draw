
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

function appendLeadingZeroes(n){
    if (n <= 9) {
        return '0' + n;
    } else {
        return n
    }
}

let last;
try {
    const last_raw = fs.readFileSync(path.join(__dirname, './data/italy/last.json'));
    last = JSON.parse(last_raw);
} catch(e) {
    last = [];
}

(async () => {
    const res = await fetch('https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni-latest.json');
    const json = await res.json();

    if(JSON.stringify(last) !== JSON.stringify(json)) {
        const regions = [
            {},
            {id: '-44874', einwohner: 4356406},
            {id: '-45155', einwohner: 125666},
            {id: '-44879', einwohner: 10060574},
            {},
            {id: '-43648', einwohner: 4905854},
            {id: '-179296', einwohner: 1215220},
            {id: '-301482', einwohner: 1550640},
            {id: '-42611', einwohner: 4459477},
            {id: '-41977', einwohner: 3729641},
            {id: '-42004', einwohner: 882015},
            {id: '-53060', einwohner: 1525271},
            {id: '-40784', einwohner: 5879082},
            {id: '-53937', einwohner: 1311580},
            {id: '-41256', einwohner: 305617},
            {id: '-40218', einwohner: 5801692},
            {id: '-40095', einwohner: 4029053},
            {id: '-40137', einwohner: 562869},
            {id: '-1783980', einwohner: 1947131},
            {id: '-39152', einwohner: 4999891},
            {id: '-7361997', einwohner: 1639591},
            {id: '-47046', einwohner: 532318},
            {id: '-45756', einwohner: 541418},
        ];

        const date = new Date(json.reduce((a, b) => a.data > b.data ? a : b).data);
        let formatted_date = appendLeadingZeroes(date.getDate()) + '-' + appendLeadingZeroes(date.getMonth() + 1) + '-' + date.getFullYear();     
        const columns_values = [ 'Insgesamnt Infizierte', 'Anzahl Genesener', 'Anzahl Verstorbener', 'Aktiv Infizierte' ];
        const columns = ['Einwohner', ...(columns_values.map(name => [name, '% ' + name[0].toLowerCase() + name.substr(1)]).flat())];
        const output = {
            title: `Coronavirus in Italien - ${formatted_date.replaceAll('-', '.')}`,
            defcolor: '#f0ffff',
            columns: columns,
            colors: ['#ff0000'],
            color_using: [ columns_values.length * 2 ],
            locations: json.map(reg => regions[reg.codice_regione].id),
            data: json.map(reg => {
                return [
                    regions[reg.codice_regione].einwohner, 
                    ...([ reg.totale_casi, reg.dimessi_guariti, reg.deceduti, reg.totale_positivi ].map(value => (
                        [value, value / regions[reg.codice_regione].einwohner * 100]
                    )).flat()),
                ];
            }),
            options: columns.map((name, i) => ({
                name: name,
                defcolor: '#f0ffff',
                colors: [ (name.match(/Genesener/i) ? '#00ff00' : (name.match(/Verstorbener|Einwohner/i) ? '#000000' : '#ff0000')) ],
                color_using: [ i ]
            })),
            option_selected: columns_values.length * 2,
        };

        fs.writeFileSync(path.join(__dirname, `../static/demo/covid-italy-${formatted_date}.json`), JSON.stringify(output));
        fs.writeFileSync(path.join(__dirname, '../static/demo/covid-italy-newest.json'), JSON.stringify(output));
        fs.writeFileSync(path.join(__dirname, './data/italy/last.json'), JSON.stringify(json));
        fs.writeFileSync(path.join(__dirname, `./data/italy/italy-${formatted_date}.json`), JSON.stringify(json));
    } else {
        process.exit(1);
    }
})()
