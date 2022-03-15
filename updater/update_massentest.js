
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const locations_to_include = {
    21006: {"id": "-47255", "einwohner": 3471},
    21108: {"id": "-47338", "einwohner": 6015},
    21001: {"id": "-47122", "einwohner": 1656},
    21038: {"id": "-47284", "einwohner": 5025},
    21003: {"id": "-47075", "einwohner": 395},
    21002: {"id": "-47247", "einwohner": 1038},
    21060: {"id": "-47139", "einwohner": 3875},
    21007: {"id": "-47266", "einwohner": 1754},
    21008: {"id": "-47207", "einwohner": 107407},
    21012: {"id": "-47173", "einwohner": 2783},
    21010: {"id": "-47337", "einwohner": 2252},
    21011: {"id": "-47300", "einwohner": 22572},
    21013: {"id": "-47317", "einwohner": 16774},
    21066: {"id": "-47272", "einwohner": 1903},
    21026: {"id": "-47252", "einwohner": 1376},
    21059: {"id": "-47145", "einwohner": 3977},
    21047: {"id": "-47278", "einwohner": 3118},
    21004: {"id": "-47203", "einwohner": 14932},
    21116: {"id": "-47298", "einwohner": 2988},
    21032: {"id": "-47322", "einwohner": 1005},
    21016: {"id": "-47330", "einwohner": 2667},
    21034: {"id": "-47331", "einwohner": 3298},
    21035: {"id": "-47260", "einwohner": 1751},
    21036: {"id": "-47290", "einwohner": 905},
    21027: {"id": "-47325", "einwohner": 2386},
    21109: {"id": "-47318", "einwohner": 2325},
    21005: {"id": "-47295", "einwohner": 780},
    21077: {"id": "-47309", "einwohner": 3349},
    21079: {"id": "-47251", "einwohner": 3074},
    21015: {"id": "-47121", "einwohner": 8085},
    21023: {"id": "-47212", "einwohner": 3421},
    21018: {"id": "-47269", "einwohner": 2286},
    21019: {"id": "-47234", "einwohner": 6881},
    21021: {"id": "-47324", "einwohner": 2927},
    21022: {"id": "-47292", "einwohner": 5219},
    21014: {"id": "-47305", "einwohner": 386},
    21024: {"id": "-47090", "einwohner": 2219},
    21025: {"id": "-47074", "einwohner": 653},
    21042: {"id": "-47258", "einwohner": 4094},
    21039: {"id": "-47275", "einwohner": 2746},
    21041: {"id": "-47268", "einwohner": 12467},
    21037: {"id": "-47262", "einwohner": 5198},
    21043: {"id": "-47206", "einwohner": 338},
    21040: {"id": "-47187", "einwohner": 18029},
    21044: {"id": "-47306", "einwohner": 1555},
    21046: {"id": "-47302", "einwohner": 5287},
    21045: {"id": "-47072", "einwohner": 1281},
    21048: {"id": "-47291", "einwohner": 2814},
    21049: {"id": "-47214", "einwohner": 829},
    21051: {"id": "-47283", "einwohner": 41170},
    21050: {"id": "-47263", "einwohner": 1694},
    21053: {"id": "-47089", "einwohner": 1714},
    21054: {"id": "-47315", "einwohner": 2066},
    21074: {"id": "-47323", "einwohner": 3161},
    21088: {"id": "-47332", "einwohner": 1421},
    21055: {"id": "-47245", "einwohner": 1979},
    21056: {"id": "-47271", "einwohner": 5889},
    21057: {"id": "-47314", "einwohner": 3245},
    21029: {"id": "-47080", "einwohner": 5463},
    21113: {"id": "-47313", "einwohner": 1602},
    21106: {"id": "-47311", "einwohner": 3170},
    21062: {"id": "-47297", "einwohner": 3815},
    21063: {"id": "-47328", "einwohner": 1598},
    21030: {"id": "-47326", "einwohner": 2860},
    21105: {"id": "-47141", "einwohner": 1050},
    21107: {"id": "-47336", "einwohner": 3090},
    21064: {"id": "-47296", "einwohner": 737},
    21067: {"id": "-47280", "einwohner": 3646},
    21009: {"id": "-47301", "einwohner": 654},
    21068: {"id": "-47339", "einwohner": 545},
    21069: {"id": "-47208", "einwohner": 256},
    21071: {"id": "-47320", "einwohner": 2911},
    21070: {"id": "-47329", "einwohner": 4538},
    21073: {"id": "-47308", "einwohner": 1394},
    21072: {"id": "-47233", "einwohner": 7966},
    21075: {"id": "-47321", "einwohner": 1262},
    21076: {"id": "-47045", "einwohner": 3807},
    21017: {"id": "-47335", "einwohner": 5517},
    21086: {"id": "-47282", "einwohner": 7160},
    21087: {"id": "-47303", "einwohner": 2916},
    21093: {"id": "-47270", "einwohner": 6242},
    21094: {"id": "-47294", "einwohner": 1839},
    21091: {"id": "-47299", "einwohner": 1245},
    21092: {"id": "-47286", "einwohner": 1879},
    21085: {"id": "-47244", "einwohner": 2015},
    21080: {"id": "-47310", "einwohner": 3569},
    21081: {"id": "-47316", "einwohner": 3879},
    21083: {"id": "-47319", "einwohner": 3244},
    21082: {"id": "-47276", "einwohner": 1754},
    21084: {"id": "-47246", "einwohner": 1541},
    21061: {"id": "-47265", "einwohner": 4864},
    21115: {"id": "-47334", "einwohner": 7044},
    21095: {"id": "-47231", "einwohner": 1150},
    21103: {"id": "-47279", "einwohner": 958},
    21096: {"id": "-47333", "einwohner": 1759},
    21097: {"id": "-47237", "einwohner": 4538},
    21100: {"id": "-47218", "einwohner": 1010},
    21101: {"id": "-47304", "einwohner": 2443},
    21099: {"id": "-47254", "einwohner": 1994},
    21028: {"id": "-47285", "einwohner": 3346},
    21098: {"id": "-47119", "einwohner": 3438},
    21102: {"id": "-47102", "einwohner": 1056},
    21020: {"id": "-47288", "einwohner": 1544},
    21104: {"id": "-47213", "einwohner": 2911},
    21118: {"id": "-47241", "einwohner": 760},
    21111: {"id": "-47307", "einwohner": 4794},
    21114: {"id": "-47287", "einwohner": 1825},
    21033: {"id": "-47277", "einwohner": 2571},
    21110: {"id": "-47327", "einwohner": 3324},
    21031: {"id": "-47232", "einwohner": 3616},
    21112: {"id": "-47281", "einwohner": 973},
    21065: {"id": "-47274", "einwohner": 191},
    21052: {"id": "-47312", "einwohner": 2919},
    21058: {"id": "-47164", "einwohner": 1999},
    21117: {"id": "-47289", "einwohner": 1398},
    21089: {"id": "-47242", "einwohner": 2586}
}

function appendLeadingZeroes(n){
    if (n <= 9) {
        return '0' + n;
    } else {
        return n
    }
}

let last;
try {
    last = fs.readFileSync(path.join(__dirname, './data/massentest/last_massentest.csv'), { encoding: 'utf-8' });
} catch(e) {
    last = '';
}

(async () => {
    const res = await fetch('https://coronatest.sabes.it/csv/municipalities.csv');
    const csv = await res.text();
    // const csv = fs.readFileSync(path.join(__dirname, './massentest-20-11-2020T16:52.csv'), { encoding: 'utf-8' });
    if (last !== csv) {
        const data = csv.split('\n').map(row => row.split(';').reduce((a, b) => {
            if (a[a.length - 1]?.[0] === '"') {
                a[a.length - 1] += b;
                if (b[b.length - 1] === '"') {
                    a[a.length - 1] = a[a.length - 1].replaceAll('"', '');
                }
                return a;
            } else {
                if (b[0] === '"' && b[b.length - 1] === '"') {
                    b = b.replaceAll('"', '');
                }
                return a.concat(b);
            }
        }, []));
        if(data.slice(1).length === 0) {
            process.exit(1);
        }
        const date = new Date(
            data.slice(1).reduce((a, b) => b[48] ? (a[48] > b[48] ? a : b) : a)[48]
                .replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6').trim()
        );
        if(isNaN(date.getTime())) {
            process.exit(1);
        }
        const formatted_date = appendLeadingZeroes(date.getDate()) + '-' + appendLeadingZeroes(date.getMonth() + 1) + '-' + date.getFullYear() + 'T' + appendLeadingZeroes(date.getHours()) + ':' + appendLeadingZeroes(date.getMinutes());
        const output = {
            title: `Südtirol testet - ${formatted_date.replaceAll('-', '.').replace('T', ' ')}`,
            defcolor: '#f0ffff',
            columns: ['Einwohner', 'Anzahl Tests', 'Anzahl Tests (Ansässige)', '% getestet', 'Positive Tests', 'Positive Tests (Ansässige)', '% positiver Tests', '% positiver Tests (Ansässige)'],
            colors: ['#ff0000'],
            color_using: [6],
            locations: data.slice(1).map(row => locations_to_include[parseFloat(row[0].trim())]?.id).filter(loc => loc),
            data: data.slice(1).map(row => {
                if(locations_to_include[parseFloat(row[0].trim())]) {
                    const location = locations_to_include[parseFloat(row[0].trim())];
                    let einwohner = parseFloat(row[3]);
                    let tested_2 = 0;
                    for(let i = 4; i <= 14; i++) {
                        tested_2 = parseFloat(row[i]) || tested_2;
                    }
                    let positive_2 = 0;
                    for(let i = 15; i <= 25; i++) {
                        positive_2 = parseFloat(row[i]) || positive_2;
                    }
                    let tested = 0;
                    for(let i = 26; i <= 36; i++) {
                        tested = parseFloat(row[i]) || tested;
                    }
                    let positive = 0;
                    for(let i = 37; i <= 47; i++) {
                        positive = parseFloat(row[i]) || positive;
                    }
                    return [
                        einwohner,
                        tested_2,
                        tested,
                        tested / einwohner * 100,
                        positive_2,
                        positive,
                        positive_2 / tested_2 * 100,
                        positive / tested * 100,
                    ];
                }
            }).filter(data => data),
        };
        fs.writeFileSync(path.join(__dirname, `../static/demo/covid-massentest-${formatted_date}.json`), JSON.stringify(output));
        fs.writeFileSync(path.join(__dirname, '../static/demo/covid-massentest-newest.json'), JSON.stringify(output));
        fs.writeFileSync(path.join(__dirname, './data/massentest/last_massentest.csv'), csv);
        fs.writeFileSync(path.join(__dirname, `./data/massentest/massentest-${formatted_date}.csv`), csv);
    } else {
        process.exit(1);
    }
})();
