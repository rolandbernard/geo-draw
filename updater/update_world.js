
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const location_to_include = {
    "Afghanistan": {
        "einwohner": 38928341,
        "id": "-303427"
    },
    "Albania": {
        "einwohner": 2877800,
        "id": "-53292"
    },
    "Algeria": {
        "einwohner": 43851043,
        "id": "-192756"
    },
    "Andorra": {
        "einwohner": 77265,
        "id": "-9407"
    },
    "Angola": {
        "einwohner": 32866268,
        "id": "-195267"
    },
    "Antigua and Barbuda": {
        "einwohner": 97928,
        "id": "-536900"
    },
    "Argentina": {
        "einwohner": 45195777,
        "id": "-286393"
    },
    "Armenia": {
        "einwohner": 2963234,
        "id": "-364066"
    },
    "Australia": {
        "einwohner": 25499881,
        "id": "-80500"
    },
    "Austria": {
        "einwohner": 9006400,
        "id": "-16239"
    },
    "Azerbaijan": {
        "einwohner": 10139175,
        "id": "-364110"
    },
    "Bahamas": {
        "einwohner": 393248,
        "id": "-547469"
    },
    "Bahrain": {
        "einwohner": 1701583,
        "id": "-378734"
    },
    "Bangladesh": {
        "einwohner": 164689383,
        "id": "-184640"
    },
    "Barbados": {
        "einwohner": 287371,
        "id": "-547511"
    },
    "Belarus": {
        "einwohner": 9449321,
        "id": "-59065"
    },
    "Belgium": {
        "einwohner": 11589616,
        "id": "-52411"
    },
    "Belize": {
        "einwohner": 397621,
        "id": "-287827"
    },
    "Benin": {
        "einwohner": 12123198,
        "id": "-192784"
    },
    "Bhutan": {
        "einwohner": 771612,
        "id": "-184629"
    },
    "Bolivia": {
        "einwohner": 11673029,
        "id": "-252645"
    },
    "Bosnia and Herzegovina": {
        "einwohner": 3280815,
        "id": "-2528142"
    },
    "Botswana": {
        "einwohner": 2351625,
        "id": "-1889339"
    },
    "Brazil": {
        "einwohner": 212559409,
        "id": "-59470"
    },
    "Brunei": {
        "einwohner": 437483,
        "id": "-2103120"
    },
    "Bulgaria": {
        "einwohner": 6948445,
        "id": "-186382"
    },
    "Burkina Faso": {
        "einwohner": 20903278,
        "id": "-192783"
    },
    "Burma": {
        "einwohner": 54409794,
        "id": "-50371"
    },
    "Burundi": {
        "einwohner": 11890781,
        "id": "-195269"
    },
    "Cabo Verde": {
        "einwohner": 555988,
        "id": "-535774"
    },
    "Cambodia": {
        "einwohner": 16718971,
        "id": "-49898"
    },
    "Cameroon": {
        "einwohner": 26545864,
        "id": "-192830"
    },
    "Canada": {
        "einwohner": 37742157,
        "id": "-1428125"
    },
    "Central African Republic": {
        "einwohner": 4829764,
        "id": "-192790"
    },
    "Chad": {
        "einwohner": 16425859,
        "id": "-2361304"
    },
    "Chile": {
        "einwohner": 19116209,
        "id": "-167454"
    },
    "China": {
        "einwohner": 1439323774,
        "id": "-270056"
    },
    "Colombia": {
        "einwohner": 50882884,
        "id": "-120027"
    },
    "Comoros": {
        "einwohner": 869595,
        "id": "-535790"
    },
    "Congo (Brazzaville)": {
        "einwohner": 5518092,
        "id": "-192794"
    },
    "Congo (Kinshasa)": {
        "einwohner": 89561404,
        "id": "-192795"
    },
    "Costa Rica": {
        "einwohner": 5094114,
        "id": "-287667"
    },
    "Cote d'Ivoire": {
        "einwohner": 26378275,
        "id": "-192779"
    },
    "Croatia": {
        "einwohner": 4105268,
        "id": "-214885"
    },
    "Cuba": {
        "einwohner": 11326616,
        "id": "-307833"
    },
    "Cyprus": {
        "einwohner": 875899,
        "id": "-307787"
    },
    "Czechia": {
        "einwohner": 10708982,
        "id": "-51684"
    },
    "Denmark": {
        "einwohner": 5792203,
        "id": "-50046"
    },
    "Djibouti": {
        "einwohner": 988002,
        "id": "-192801"
    },
    "Dominica": {
        "einwohner": 71991,
        "id": "-307823"
    },
    "Dominican Republic": {
        "einwohner": 10847904,
        "id": "-307828"
    },
    "Ecuador": {
        "einwohner": 17643060,
        "id": "-108089"
    },
    "Egypt": {
        "einwohner": 102334403,
        "id": "-1473947"
    },
    "El Salvador": {
        "einwohner": 6486201,
        "id": "-1520612"
    },
    "Equatorial Guinea": {
        "einwohner": 1402985,
        "id": "-192791"
    },
    "Eritrea": {
        "einwohner": 3546427,
        "id": "-296961"
    },
    "Estonia": {
        "einwohner": 1326539,
        "id": "-79510"
    },
    "Eswatini": {
        "einwohner": 1160164,
        "id": "-88210"
    },
    "Ethiopia": {
        "einwohner": 114963583,
        "id": "-192800"
    },
    "Fiji": {
        "einwohner": 896444,
        "id": "-571747"
    },
    "Finland": {
        "einwohner": 5540718,
        "id": "-54224"
    },
    "France": {
        "einwohner": 65273512,
        "id": "-2202162"
    },
    "Gabon": {
        "einwohner": 2225728,
        "id": "-192793"
    },
    "Gambia": {
        "einwohner": 2416664,
        "id": "-192774"
    },
    "Georgia": {
        "einwohner": 3989175,
        "id": "-1983628"
    },
    "Germany": {
        "einwohner": 83783945,
        "id": "-51477"
    },
    "Ghana": {
        "einwohner": 31072945,
        "id": "-192781"
    },
    "Greece": {
        "einwohner": 10423056,
        "id": "-192307"
    },
    "Grenada": {
        "einwohner": 112519,
        "id": "-550727"
    },
    "Guatemala": {
        "einwohner": 17915567,
        "id": "-1521463"
    },
    "Guinea": {
        "einwohner": 13132792,
        "id": "-192778"
    },
    "Guinea-Bissau": {
        "einwohner": 1967998,
        "id": "-192776"
    },
    "Guyana": {
        "einwohner": 786559,
        "id": "-287083"
    },
    "Haiti": {
        "einwohner": 11402533,
        "id": "-307829"
    },
    "Holy See": {
        "einwohner": 809,
        "id": "-36989"
    },
    "Honduras": {
        "einwohner": 9904608,
        "id": "-287670"
    },
    "Hungary": {
        "einwohner": 9660350,
        "id": "-21335"
    },
    "Iceland": {
        "einwohner": 341250,
        "id": "-299133"
    },
    "India": {
        "einwohner": 1380004385,
        "id": "-304716"
    },
    "Indonesia": {
        "einwohner": 273523621,
        "id": "-304751"
    },
    "Iran": {
        "einwohner": 83992953,
        "id": "-304938"
    },
    "Iraq": {
        "einwohner": 40222503,
        "id": "-304934"
    },
    "Ireland": {
        "einwohner": 4937796,
        "id": "-62273"
    },
    "Israel": {
        "einwohner": 8655541,
        "id": "-1473946"
    },
    "Italy": {
        "einwohner": 60461828,
        "id": "-365331"
    },
    "Jamaica": {
        "einwohner": 2961161,
        "id": "-555017"
    },
    "Japan": {
        "einwohner": 126476458,
        "id": "-382313"
    },
    "Jordan": {
        "einwohner": 10203140,
        "id": "-184818"
    },
    "Kazakhstan": {
        "einwohner": 18776707,
        "id": "-214665"
    },
    "Kenya": {
        "einwohner": 53771300,
        "id": "-192798"
    },
    "Korea South": {
        "einwohner": 51269183,
        "id": "-307756"
    },
    "Kosovo": {
        "einwohner": 1932774,
        "id": "-2088990"
    },
    "Kuwait": {
        "einwohner": 4270563,
        "id": "-305099"
    },
    "Kyrgyzstan": {
        "einwohner": 6524191,
        "id": "-178009"
    },
    "Laos": {
        "einwohner": 7275556,
        "id": "-49903"
    },
    "Latvia": {
        "einwohner": 1886202,
        "id": "-72594"
    },
    "Lebanon": {
        "einwohner": 6825442,
        "id": "-184843"
    },
    "Lesotho": {
        "einwohner": 2142252,
        "id": "-2093234"
    },
    "Liberia": {
        "einwohner": 5057677,
        "id": "-192780"
    },
    "Libya": {
        "einwohner": 6871287,
        "id": "-192758"
    },
    "Liechtenstein": {
        "einwohner": 38137,
        "id": "-1155955"
    },
    "Lithuania": {
        "einwohner": 2722291,
        "id": "-72596"
    },
    "Luxembourg": {
        "einwohner": 625976,
        "id": "-2171347"
    },
    "Madagascar": {
        "einwohner": 27691019,
        "id": "-447325"
    },
    "Malawi": {
        "einwohner": 19129955,
        "id": "-195290"
    },
    "Malaysia": {
        "einwohner": 32365998,
        "id": "-2108121"
    },
    "Maldives": {
        "einwohner": 540542,
        "id": "-536773"
    },
    "Mali": {
        "einwohner": 20250834,
        "id": "-192785"
    },
    "Malta": {
        "einwohner": 441539,
        "id": "-365307"
    },
    "Marshall Islands": {
        "einwohner": 59194,
        "id": "-571771"
    },
    "Mauritania": {
        "einwohner": 4649660,
        "id": "-192763"
    },
    "Mauritius": {
        "einwohner": 1271767,
        "id": "-535828"
    },
    "Mexico": {
        "einwohner": 128932753,
        "id": "-114686"
    },
    "Moldova": {
        "einwohner": 4033963,
        "id": "-58974"
    },
    "Monaco": {
        "einwohner": 39244,
        "id": "-1124039"
    },
    "Mongolia": {
        "einwohner": 3278292,
        "id": "-161033"
    },
    "Montenegro": {
        "einwohner": 628062,
        "id": "-53296"
    },
    "Morocco": {
        "einwohner": 36910558,
        "id": "-3630439"
    },
    "Mozambique": {
        "einwohner": 31255435,
        "id": "-195273"
    },
    "Namibia": {
        "einwohner": 2540916,
        "id": "-195266"
    },
    "Nepal": {
        "einwohner": 29136808,
        "id": "-184633"
    },
    "Netherlands": {
        "einwohner": 17134873,
        "id": "-2323309"
    },
    "New Zealand": {
        "einwohner": 4822233,
        "id": "-556706"
    },
    "Nicaragua": {
        "einwohner": 6624554,
        "id": "-287666"
    },
    "Niger": {
        "einwohner": 24206636,
        "id": "-192786"
    },
    "Nigeria": {
        "einwohner": 206139587,
        "id": "-192787"
    },
    "North Macedonia": {
        "einwohner": 2083380,
        "id": "-53293"
    },
    "Norway": {
        "einwohner": 5421242,
        "id": "-2978650"
    },
    "Oman": {
        "einwohner": 5106622,
        "id": "-305138"
    },
    "Pakistan": {
        "einwohner": 220892331,
        "id": "-307573"
    },
    "Panama": {
        "einwohner": 4314768,
        "id": "-287668"
    },
    "Papua New Guinea": {
        "einwohner": 8947027,
        "id": "-307866"
    },
    "Paraguay": {
        "einwohner": 7132530,
        "id": "-287077"
    },
    "Peru": {
        "einwohner": 32971846,
        "id": "-288247"
    },
    "Philippines": {
        "einwohner": 109581085,
        "id": "-443174"
    },
    "Poland": {
        "einwohner": 37846605,
        "id": "-49715"
    },
    "Portugal": {
        "einwohner": 10196707,
        "id": "-295480"
    },
    "Qatar": {
        "einwohner": 2881060,
        "id": "-305095"
    },
    "Romania": {
        "einwohner": 19237682,
        "id": "-90689"
    },
    "Russia": {
        "einwohner": 145934460,
        "id": "-60189"
    },
    "Rwanda": {
        "einwohner": 12952209,
        "id": "-171496"
    },
    "Saint Kitts and Nevis": {
        "einwohner": 53192,
        "id": "-536899"
    },
    "Saint Lucia": {
        "einwohner": 183629,
        "id": "-550728"
    },
    "Saint Vincent and the Grenadines": {
        "einwohner": 110947,
        "id": "-550725"
    },
    "San Marino": {
        "einwohner": 33938,
        "id": "-54624"
    },
    "Sao Tome and Principe": {
        "einwohner": 219161,
        "id": "-535880"
    },
    "Saudi Arabia": {
        "einwohner": 34813867,
        "id": "-307584"
    },
    "Senegal": {
        "einwohner": 16743930,
        "id": "-192775"
    },
    "Serbia": {
        "einwohner": 6804596,
        "id": "-1741311"
    },
    "Seychelles": {
        "einwohner": 98340,
        "id": "-536765"
    },
    "Sierra Leone": {
        "einwohner": 7976985,
        "id": "-192777"
    },
    "Singapore": {
        "einwohner": 5850343,
        "id": "-536780"
    },
    "Slovakia": {
        "einwohner": 5459643,
        "id": "-14296"
    },
    "Slovenia": {
        "einwohner": 2078932,
        "id": "-218657"
    },
    "Solomon Islands": {
        "einwohner": 686878,
        "id": "-1857436"
    },
    "Somalia": {
        "einwohner": 15893219,
        "id": "-192799"
    },
    "South Africa": {
        "einwohner": 59308690,
        "id": "-87565"
    },
    "South Sudan": {
        "einwohner": 11193729,
        "id": "-1656678"
    },
    "Spain": {
        "einwohner": 46754783,
        "id": "-1311341"
    },
    "Sri Lanka": {
        "einwohner": 21413250,
        "id": "-536807"
    },
    "Sudan": {
        "einwohner": 43849269,
        "id": "-192789"
    },
    "Suriname": {
        "einwohner": 586634,
        "id": "-287082"
    },
    "Sweden": {
        "einwohner": 10099270,
        "id": "-52822"
    },
    "Switzerland": {
        "einwohner": 8654618,
        "id": "-51701"
    },
    "Syria": {
        "einwohner": 17500657,
        "id": "-184840"
    },
    "Taiwan*": {
        "einwohner": 23816775,
        "id": "-449220"
    },
    "Tajikistan": {
        "einwohner": 9537642,
        "id": "-214626"
    },
    "Tanzania": {
        "einwohner": 59734213,
        "id": "-195270"
    },
    "Thailand": {
        "einwohner": 69799978,
        "id": "-2067731"
    },
    "Timor-Leste": {
        "einwohner": 1318442,
        "id": "-305142"
    },
    "Togo": {
        "einwohner": 8278737,
        "id": "-192782"
    },
    "Trinidad and Tobago": {
        "einwohner": 1399491,
        "id": "-555717"
    },
    "Tunisia": {
        "einwohner": 11818618,
        "id": "-192757"
    },
    "Turkey": {
        "einwohner": 84339067,
        "id": "-174737"
    },
    "US": {
        "einwohner": 331002647,
        "id": "-148838"
    },
    "Uganda": {
        "einwohner": 45741000,
        "id": "-192796"
    },
    "Ukraine": {
        "einwohner": 43733759,
        "id": "-60199"
    },
    "United Arab Emirates": {
        "einwohner": 9890400,
        "id": "-307763"
    },
    "United Kingdom": {
        "einwohner": 67886004,
        "id": "-62149"
    },
    "Uruguay": {
        "einwohner": 3473727,
        "id": "-287072"
    },
    "Uzbekistan": {
        "einwohner": 33469199,
        "id": "-196240"
    },
    "Vanuatu": {
        "einwohner": 307150,
        "id": "-2177246"
    },
    "Venezuela": {
        "einwohner": 28435943,
        "id": "-272644"
    },
    "Vietnam": {
        "einwohner": 97338583,
        "id": "-49915"
    },
    "West Bank and Gaza": {
        "einwohner": 5101416,
        "id": "-1703814"
    },
    "Western Sahara": {
        "einwohner": 597330,
        "id": "-5441968"
    },
    "Yemen": {
        "einwohner": 29825968,
        "id": "-305092"
    },
    "Zambia": {
        "einwohner": 18383956,
        "id": "-195271"
    },
    "Zimbabwe": {
        "einwohner": 14862927,
        "id": "-195272"
    }
};

function appendLeadingZeroes(n){
    if (n <= 9) {
        return '0' + n;
    } else {
        return n
    }
}

let last;
try {
    last = fs.readFileSync(path.join(__dirname, './data/world/last.csv'), { encoding:'utf8' });
} catch(e) {
    last = '';
}

(async () => {
    const to_check = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const to_check_formated = appendLeadingZeroes(to_check.getMonth() + 1) + '-' + appendLeadingZeroes(to_check.getDate()) + '-' + to_check.getFullYear();
    const res = await fetch(`https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${to_check_formated}.csv`);
    const csv = await res.text();

    if (last !== csv) {
        const data = csv.split('\n').map(row => row.split(',').reduce((a, b) => {
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
        const data_unified = {};
        data.forEach(row => {
            const country = row[3];
            if (data_unified[country]) {
                data_unified[country].total_cases += parseFloat(row[7]) || 0;
                data_unified[country].active_cases += parseFloat(row[10]) || 0;
                data_unified[country].recovered += parseFloat(row[9]) || 0;
                data_unified[country].deseased += parseFloat(row[8]) || 0;
            } else {
                data_unified[country] = {
                    total_cases: parseFloat(row[7]) || 0,
                    active_cases: parseFloat(row[10]) || 0,
                    recovered: parseFloat(row[9]) || 0,
                    deseased: parseFloat(row[8]) || 0,
                };
            }
        });
        if(data.slice(1).length === 0) {
            process.exit(1);
        }
        const date = new Date(data.slice(1).reduce((a, b) => b[4] ? (a[4] > b[4] ? a : b) : a)[4]);
        if(isNaN(date?.getTime())) {
            process.exit(1);
        }
        const locations = Object.keys(location_to_include).filter(loc => data_unified[loc]).map(loc => {
            return ({
                id: location_to_include[loc].id,
                data: [
                    location_to_include[loc].einwohner || 0,
                    ...([
                        data_unified[loc].total_cases || 0,
                        data_unified[loc].recovered || 0,
                        data_unified[loc].deseased || 0,
                        data_unified[loc].active_cases || 0,
                    ].map(value => [value, value / location_to_include[loc].einwohner * 100 ]).flat())
                ],
            });
        });
        const formatted_date = appendLeadingZeroes(date.getDate()) + '-' + appendLeadingZeroes(date.getMonth() + 1) + '-' + date.getFullYear();
        const columns_values = [ 'Insgesamnt Infizierte', 'Anzahl Genesener', 'Anzahl Verstorbener', 'Aktiv Infizierte' ];
        const columns = ['Einwohner', ...(columns_values.map(name => [name, '% ' + name[0].toLowerCase() + name.substr(1)]).flat())];
        const output = {
            title: `Coronavirus Weltweit - ${formatted_date.replaceAll('-', '.')}`,
            defcolor: '#f0ffff',
            columns: columns,
            colors: ['#ff0000'],
            color_using: [ 2 ],
            locations: locations.map(loc => loc.id),
            data: locations.map(loc => loc.data),
            options: columns.map((name, i) => ({
                name: name,
                defcolor: '#f0ffff',
                colors: [ (name.match(/Genesener/i) ? '#00ff00' : (name.match(/Verstorbener|Einwohner/i) ? '#000000' : '#ff0000')) ],
                color_using: [ i ]
            })),
            option_selected: 2,
        };
        fs.writeFileSync(path.join(__dirname, `../static/demo/covid-world-${formatted_date}.json`), JSON.stringify(output));
        fs.writeFileSync(path.join(__dirname, '../static/demo/covid-world-newest.json'), JSON.stringify(output));
        fs.writeFileSync(path.join(__dirname, './data/world/last.csv'), csv);
        fs.writeFileSync(path.join(__dirname, `./data/world/world-${formatted_date}.csv`), csv);
    } else {
        process.exit(1);
    }
})()

