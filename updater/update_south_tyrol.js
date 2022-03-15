
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const puppeteer = require('puppeteer');
const xlsx = require('xlsx');


const NUM_PAGES_TO_VISIT = 1;
const NEW_PAGE_DELAY = 500;
const OUTPUT_DIRECTORY = '../static/demo/';
const SEARCHED_LINKS = './data/south-tyrol/exisiting.json';
// Only locations in this set will be exported
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
const locations_to_include_old = {
    "BADIA": {"id": "-47255", "einwohner": 3471},
    "VALLE AURINA": {"id": "-47338", "einwohner": 6015},
    "ALDINO": {"id": "-47122", "einwohner": 1656},
    "LAGUNDO": {"id": "-47284", "einwohner": 5025},
    "ANTERIVO": {"id": "-47075", "einwohner": 395},
    "ANDRIANO": {"id": "-47247", "einwohner": 1038},
    "ORA": {"id": "-47139", "einwohner": 3875},
    "BARBIANO": {"id": "-47266", "einwohner": 1754},
    "BOLZANO": {"id": "-47207", "einwohner": 107407},
    "BRONZOLO": {"id": "-47173", "einwohner": 2783},
    "BRENNERO": {"id": "-47337", "einwohner": 2252},
    "BRESSANONE": {"id": "-47300", "einwohner": 22572},
    "BRUNICO": {"id": "-47317", "einwohner": 16774},
    "POSTAL": {"id": "-47272", "einwohner": 1903},
    "CORVARA IN BADIA": {"id": "-47252", "einwohner": 1376},
    "NOVA PONENTE": {"id": "-47145", "einwohner": 3977},
    "MAREBBE": {"id": "-47278", "einwohner": 3118},
    "APPIANO SULLA STRADA DEL VINO": {"id": "-47203", "einwohner": 14932},
    "VELTURNO": {"id": "-47298", "einwohner": 2988},
    "FORTEZZA": {"id": "-47322", "einwohner": 1005},
    "CAMPO DI TRENS": {"id": "-47330", "einwohner": 2667},
    "GAIS": {"id": "-47331", "einwohner": 3298},
    "GARGAZZONE": {"id": "-47260", "einwohner": 1751},
    "GLORENZA": {"id": "-47290", "einwohner": 905},
    "CURON VENOSTA": {"id": "-47325", "einwohner": 2386},
    "VALLE DI CASIES": {"id": "-47318", "einwohner": 2325},
    "AVELENGO": {"id": "-47295", "einwohner": 780},
    "SAN CANDIDO": {"id": "-47309", "einwohner": 3349},
    "SAN GENESIO ATESINO": {"id": "-47251", "einwohner": 3074},
    "CALDARO SULLA STRADA DEL VINO": {"id": "-47121", "einwohner": 8085},
    "CORNEDO ALL'ISARCO": {"id": "-47212", "einwohner": 3421},
    "CASTELBELLO-CIARDES": {"id": "-47269", "einwohner": 2286},
    "CASTELROTTO": {"id": "-47234", "einwohner": 6881},
    "CHIENES": {"id": "-47324", "einwohner": 2927},
    "CHIUSA": {"id": "-47292", "einwohner": 5219},
    "CAINES": {"id": "-47305", "einwohner": 386},
    "CORTACCIA SULLA STRADA DEL VINO": {"id": "-47090", "einwohner": 2219},
    "CORTINA SULLA STRADA DEL VINO": {"id": "-47074", "einwohner": 653},
    "LASA": {"id": "-47258", "einwohner": 4094},
    "LAION": {"id": "-47275", "einwohner": 2746},
    "LANA": {"id": "-47268", "einwohner": 12467},
    "LACES": {"id": "-47262", "einwohner": 5198},
    "LAUREGNO": {"id": "-47206", "einwohner": 338},
    "LAIVES": {"id": "-47187", "einwohner": 18029},
    "LUSON": {"id": "-47306", "einwohner": 1555},
    "MALLES VENOSTA": {"id": "-47302", "einwohner": 5287},
    "MAGRE' SULLA STRADA DEL VINO": {"id": "-47072", "einwohner": 1281},
    "MARLENGO": {"id": "-47291", "einwohner": 2814},
    "MARTELLO": {"id": "-47214", "einwohner": 829},
    "MERANO": {"id": "-47283", "einwohner": 41170},
    "MELTINA": {"id": "-47263", "einwohner": 1694},
    "MONTAGNA": {"id": "-47089", "einwohner": 1714},
    "MOSO IN PASSIRIA": {"id": "-47315", "einwohner": 2066},
    "RIO DI PUSTERIA": {"id": "-47323", "einwohner": 3161},
    "SELVA DEI MOLINI": {"id": "-47332", "einwohner": 1421},
    "NALLES": {"id": "-47245", "einwohner": 1979},
    "NATURNO": {"id": "-47271", "einwohner": 5889},
    "NAZ-SCIAVES": {"id": "-47314", "einwohner": 3245},
    "EGNA": {"id": "-47080", "einwohner": 5463},
    "VILLABASSA": {"id": "-47313", "einwohner": 1602},
    "VALDAORA": {"id": "-47311", "einwohner": 3170},
    "PARCINES": {"id": "-47297", "einwohner": 3815},
    "PERCA": {"id": "-47328", "einwohner": 1598},
    "FALZES": {"id": "-47326", "einwohner": 2860},
    "VADENA": {"id": "-47141", "einwohner": 1050},
    "VAL DI VIZZE": {"id": "-47336", "einwohner": 3090},
    "PLAUS": {"id": "-47296", "einwohner": 737},
    "PRATO ALLO STELVIO": {"id": "-47280", "einwohner": 3646},
    "BRAIES": {"id": "-47301", "einwohner": 654},
    "PREDOI": {"id": "-47339", "einwohner": 545},
    "PROVES": {"id": "-47208", "einwohner": 256},
    "RASUN ANTERSELVA": {"id": "-47320", "einwohner": 2911},
    "RACINES": {"id": "-47329", "einwohner": 4538},
    "RIFIANO": {"id": "-47308", "einwohner": 1394},
    "RENON": {"id": "-47233", "einwohner": 7966},
    "RODENGO": {"id": "-47321", "einwohner": 1262},
    "SALORNO SULLA STRADA DEL VINO": {"id": "-47045", "einwohner": 3807},
    "CAMPO TURES": {"id": "-47335", "einwohner": 5517},
    "SARENTINO": {"id": "-47282", "einwohner": 7160},
    "SCENA": {"id": "-47303", "einwohner": 2916},
    "SILANDRO": {"id": "-47270", "einwohner": 6242},
    "SLUDERNO": {"id": "-47294", "einwohner": 1839},
    "SENALES": {"id": "-47299", "einwohner": 1245},
    "SESTO": {"id": "-47286", "einwohner": 1879},
    "SANTA CRISTINA VALGARDENA": {"id": "-47244", "einwohner": 2015},
    "SAN LEONARDO IN PASSIRIA": {"id": "-47310", "einwohner": 3569},
    "SAN LORENZO DI SEBATO": {"id": "-47316", "einwohner": 3879},
    "SAN MARTINO IN PASSIRIA": {"id": "-47319", "einwohner": 3244},
    "SAN MARTINO IN BADIA": {"id": "-47276", "einwohner": 1754},
    "SAN PANCRAZIO": {"id": "-47246", "einwohner": 1541},
    "ORTISEI": {"id": "-47265", "einwohner": 4864},
    "VIPITENO": {"id": "-47334", "einwohner": 7044},
    "STELVIO": {"id": "-47231", "einwohner": 1150},
    "TUBRE": {"id": "-47279", "einwohner": 958},
    "TERENTO": {"id": "-47333", "einwohner": 1759},
    "TERLANO": {"id": "-47237", "einwohner": 4538},
    "TIRES": {"id": "-47218", "einwohner": 1010},
    "TIROLO": {"id": "-47304", "einwohner": 2443},
    "TESIMO": {"id": "-47254", "einwohner": 1994},
    "DOBBIACO": {"id": "-47285", "einwohner": 3346},
    "TERMENO SULLA STRADA DEL VINO": {"id": "-47119", "einwohner": 3438},
    "TRODENA NEL PARCO NATURALE": {"id": "-47102", "einwohner": 1056},
    "CERMES": {"id": "-47288", "einwohner": 1544},
    "ULTIMO": {"id": "-47213", "einwohner": 2911},
    "SENALE-SAN FELICE": {"id": "-47241", "einwohner": 760},
    "VARNA": {"id": "-47307", "einwohner": 4794},
    "VILLANDRO": {"id": "-47287", "einwohner": 1825},
    "FUNES": {"id": "-47277", "einwohner": 2571},
    "VANDOIES": {"id": "-47327", "einwohner": 3324},
    "FIE' ALLO SCILIAR": {"id": "-47232", "einwohner": 3616},
    "VERANO": {"id": "-47281", "einwohner": 973},
    "PONTE GARDENA": {"id": "-47274", "einwohner": 191},
    "MONGUELFO - TESIDO": {"id": "-47312", "einwohner": 2919},
    "NOVA LEVANTE": {"id": "-47164", "einwohner": 1999},
    "LA VALLE": {"id": "-47289", "einwohner": 1398},
    "SELVA DI VAL GARDENA": {"id": "-47242", "einwohner": 2586}
};

function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${(day < 10 ? '0' : '') + day}-${(month < 10 ? '0' : '') + month}-${year}`;
}

function splitCellName(name) {
    let col = 0;
    let row = 0;
    if(name.match(/[A-Z]+[0-9]+/)) {
        for(let char of name) {
            if(char >= '0' && char <= '9') {
                row *= 10;
                row += char.charCodeAt(0) - '0'.codePointAt(0);
            } else {
                col *= 26;
                col += char.charCodeAt(0) - 'A'.codePointAt(0) + 1;
            }
        }
    } else {
        col = 1;
        row = 1;
    }
    return [ col - 1, row - 1 ];
}

function convertToArray(sheet) {
    let col_max = 0;
    let row_max = 0;
    for(const cell_name of Object.keys(sheet)) {
        const [ col, row ] = splitCellName(cell_name);
        if(col > col_max) {
            col_max = col;
        }
        if(row > row_max) {
            row_max = row;
        }
    }
    let ret = [...Array(row_max + 1).keys()].map(() => Array(col_max + 1));
    for(const cell_name of Object.keys(sheet)) {
        const [ col, row ] = splitCellName(cell_name);
        ret[row][col] = sheet[cell_name].v;
    }
    return ret;
}

async function readDataFromLink(xlsx_link) {
    const response = await fetch(xlsx_link);
    const workbook = xlsx.read(await response.arrayBuffer(), { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    // Convert the xlsx to an array for easy handling
    const data = convertToArray(worksheet);
    const date = data[2].reduce((date, cell) => {
        const match = cell.match(/(\d{2})-(\d{2})-(\d{4})/);
        if(match) {
            const new_date = new Date(`${match[3]}-${match[2]}-${match[1]}`);
            return new_date > date ? new_date : date;
        } else {
            return date;
        }
    }, null);
    if(isNaN(date?.getTime())) {
        console.error('Failed to determine date');
        process.exit(1);
    }
    xlsx.writeFile(workbook, path.join(__dirname, `./data/south-tyrol/south-tyrol-${formatDate(date)}.xlsx`));
    const date_as_string = formatDate(date);
    // To accomodate changes in the layout I generate the coloumns of each data
    const istat_col = data[2].findIndex(cell => cell?.match(/istat/i));
    const name_col = data[2].map((c, i) => [c, i]).filter(([cell]) => cell?.match(/comune di residenza/i)).pop()?.[1];
    const total_col = data[2].map((c, i) => [c, i]).filter(([cell]) => (
        cell?.match(/total(e|i)/i) || cell?.match(/PCR/i) || cell?.match(/positiv getestete|testati positivi/i)
    ) && cell?.includes(date_as_string))[0]?.[1];
    const recovered_col = data[2].map((c, i) => [c, i]).filter(([cell]) => cell?.match(/total(e|i)/i) && cell?.includes(date_as_string))[1]?.[1];
    const deseased_col = data[2].findIndex(cell => cell?.match(/decedut(i|e)/i) && cell?.includes(date_as_string));
    const active_col = data[2].findIndex(cell => (cell?.match(/attivi/i) || cell?.match(/attualmente/i)) /*&& cell?.includes(date_as_string)*/);
    const values = {
        'Covid-19 Infektionen': total_col,
        'Anzahl Genesener': recovered_col,
        'Anzahl Verstorbener': deseased_col,
        'Aktiv infizierte': active_col, 
    };
    Object.keys(values).forEach(key => {
        // This is not just !entry[key] to avoid removing 0
        if(values[key] === null || values[key] === undefined || values[key] === -1) {
            delete values[key];
        }
    });
    if(!values['Covid-19 Infektionen'] || !values['Aktiv infizierte']) {
        console.error('Failed to identify columns');
        console.error(values);
        process.exit(1);
    }
    // Extract the data
    const output_data = [];
    const locations = [];
    for(const row of data) {
        if (row[name_col]?.match(/totale/i)) {
            const id = istat_col !== -1 && parseFloat(row[istat_col]);
            const name = name_col !== -1 && row[name_col].replace(/totale/i, '').trim();
            if(id && locations_to_include[id]) {
                if(locations_to_include[id].id !== locations_to_include_old[name]?.id) {
                    console.log(id, name);
                }
                locations.push(locations_to_include[id].id);
                output_data.push([
                    locations_to_include[id].einwohner,
                    ...(Object.values(values)
                        .map(col => parseFloat(row[col]))
                        .map(val => [val, val / locations_to_include[id].einwohner * 100])
                        .flat()),
                ]);
            }
        }
    }
    if(locations.length === 0) {
        console.error('Failed to identify locations');
        process.exit(1);
    }
    const columns = ['Einwohner', ...(Object.keys(values).map(name => [name, '% ' + name[0].toLowerCase() + name.substr(1)]).flat())];
    const output = {
        title: `Coronavirus in Südtirol - ${formatDate(date).replaceAll('-', '.')}`,
        defcolor: '#f0ffff',
        columns: columns,
        colors: ['#ff0000'],
        color_using: [Object.keys(values).length * 2],
        locations: locations,
        data: output_data,
        options: columns.map((name, i) => ({
            name: name,
            defcolor: '#f0ffff',
            colors: [ (name.match(/Genesener/i) ? '#00ff00' : (name.match(/Verstorbener|Einwohner/i) ? '#000000' : '#ff0000')) ],
            color_using: [ i ]
        })),
        option_selected: Object.keys(values).length * 2,
    };
    return { data: output, date: date };
}

async function getDownloadLinks(to_avoid) {
    const visited_links = new Set();
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium'
    });
    // Use the code below only for debuging
    // const browser = await puppeteer.connect({
    //     browserWSEndpoint: 'ws://127.0.0.1:9222/devtools/browser/472b7d09-023c-4dfd-b465-46e1b3a54d55',
    //     defaultViewport: {width: 1500, height: 1000}
    // });
    const page = await browser.newPage();
    // Get the link for every page
    const page_links = [...Array(NUM_PAGES_TO_VISIT).keys()].map(pag => `https://sabes.it/de/news.asp?aktuelles_page=${pag + 1}`);
    // Visit all pages and return the links of all the artikles
    const artikle_links = (await page_links.reduce((pr, page_link) => {
        return pr.then(async (v) => {
            await page.goto(page_link, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(NEW_PAGE_DELAY);
            const artikle_links = await page.$$eval('.news .box h3 a', (elements) => {
                return elements.filter(el => el.innerText.match(/coronavirus/i)).map(el => el.href);
            });
            return [...v, ...artikle_links];
        });
    }, new Promise(res => res([])))).filter(link => !to_avoid.has(link));
    // Visit all artikles and return the download links
    const xlsx_links = (await artikle_links.reduce((promis, artikle_link) => {
        return promis.then(async (v) => {
            await page.goto(artikle_link, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(NEW_PAGE_DELAY);
            const download_links = await page.$$eval('.downloads ol li a', (elements) => {
                return elements.filter(el => el.innerText.match(/positiv/i)).map(el => el.href);
            });
            // If the download link is already pressent
            if(download_links.length > 0) {
                visited_links.add(artikle_link);
                download_links.forEach(link => visited_links.add(link));
                return [...v, ...download_links];
            } else {
                return v;
            }
        })
    }, new Promise(res => res([])))).filter(link => !to_avoid.has(link));
    await browser.close();
    return { xlsx_links: xlsx_links, visited_links: visited_links };
}

(async () => {
    // Load the list of links that were already searched and should be skiped
    let existing = new Set();
    try {
        const existing_raw = fs.readFileSync(path.join(__dirname, SEARCHED_LINKS));
        existing = new Set(JSON.parse(existing_raw));
    } catch(e) {}
    // Get all new links
    const { xlsx_links, visited_links } = await getDownloadLinks(existing);
    if(xlsx_links.length === 0) {
        console.error('Failed to load data');
        process.exit(1);
    }
    let newest_date = null;
    let newest_data = null;
    await xlsx_links.reduce((promis, link) => {
        return promis.then(async () => {
            const { data, date } = await readDataFromLink(link); 
            if(!newest_date || date > newest_date) {
                newest_date = date;
                newest_data = data;
            }
            fs.writeFileSync(path.join(__dirname, OUTPUT_DIRECTORY, `covid-south-tyrol-${formatDate(date)}.json`), JSON.stringify(data));
            fs.writeFileSync(path.join(__dirname, OUTPUT_DIRECTORY, `covid-south-tyrol-newest.json`), JSON.stringify(newest_data));
            existing.add(link);
            fs.writeFileSync(path.join(__dirname, SEARCHED_LINKS), JSON.stringify([...existing]));
        })
    }, new Promise(res => res()));
    fs.writeFileSync(path.join(__dirname, SEARCHED_LINKS), JSON.stringify([...new Set([...existing, ...visited_links])]));
})();

