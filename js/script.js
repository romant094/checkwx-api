// TODO delete test data and all usage of it
let testData = {
    "wind": {"degrees": 230, "speed_kts": 17, "speed_mph": 20, "speed_mps": 9},
    "temperature": {"celsius": 26, "fahrenheit": 79},
    "dewpoint": {"celsius": 14, "fahrenheit": 57},
    "humidity": {"percent": 48},
    "barometer": {"hg": 30, "hpa": 1016, "kpa": 101.59, "mb": 1015.92},
    "visibility": {"miles": "Greater than 6", "miles_float": 6.21, "meters": "10,000+", "meters_float": 10000},
    "elevation": {"feet": 623.36, "meters": 190},
    "location": {"coordinates": [37.4146, 55.972599], "type": "Point"},
    "icao": "UUEE",
    "observed": "2019-05-30T11:30:00.000Z",
    "raw_text": "UUEE 301130Z 23009MPS 9999 SCT053TCU 26/14 Q1016 R24L/CLRD62 R24C/CLRD62 TEMPO 24010G15MPS 3100 -TSRA BKN012CB",
    "station": {"name": "Sheremetyevo International"},
    "clouds": [{"code": "SCT", "text": "Scattered", "base_feet_agl": 5300, "base_meters_agl": 1615.44}],
    "flight_category": "VFR",
    "conditions": [{code:'SHRA'}]
};

const d = document,
    fetchBtn = d.querySelector('#fetch-btn'),
    infoBlock = d.querySelector('.information'),
    errorBlock = d.querySelector('.error'),
    codeInput = d.querySelector('#airport-id'),
    metarDecBlock = d.querySelector('.metar-decryption');

const _apiUrls = {
    yandex: 'https://translateYandex.yandex.net/api/v1.5/tr.json/translateYandex',
    checkwx: 'https://api.checkwx.com'
};
const _apiKeys = {
    yandex: 'trnsl.1.1.20190524T141447Z.0213b37ed61910ce.e7ba9c225b0757bc761e59234afb437f37c8fefb',
    checkwx: 'ef56bcec85ea6dc0afbe008abc'
};

const _dictionary = {
    clouds: {
        SCT: 'разбросанная',
        SKS: 'ясно',
        NSC: 'не существенная',
        FEW: 'незначит., рассеянная',
        SKT: 'отдельная разбросанная',
        BKN: 'значительная разбросанная',
        OVC: 'сплошная',
        CB: 'кучево-дождевая',
        CAVOK: 'условия хорошие'
    },
    // TODO Fill in conditions object
    conditions: {
        VCFG: 'туман на расстоянии',
        FZFG: 'переохлаждённый туман',
        MIFG: 'туман поземный',
        PRFG: 'туман просвечивающий',
        FG: 'туман',
        BR: 'дымка',
        HZ: 'мгла',
        FU: 'дым',
        DS: 'пыльная буря',
        SS: 'песчаная буря',
        DRSA: 'песчаный позёмок',
        DRDU: 'пыльный позёмок',
        DU: 'пыль в воздухе (пыльная мгла)',
        DRSN: 'снежный позёмок',
        BLSN: 'метель',
        RASN: 'дождь со снегом',
        SNRA: 'снег с дождём',
        SHSN: 'ливневой снег',
        SHRA: 'ливневой дождь',
        DZ: 'морось',
        SG: 'снежные зёрна',
        RA: 'дождь',
        SN: 'снег',
        IC: 'ледяные иглы',
        PE: 'ледяной дождь (гололёд)',
        GS: 'ледяная крупа (гололёд)',
        FZRA: 'переохлаждённый дождь (гололёд)',
        FZDZ: 'переохлаждённая морось (гололёд)',
        TSRA: 'гроза с дождём',
        TSGR: 'гроза с градом',
        TSGS: 'гроза, слабый град',
        TSSN: 'гроза со снегом',
        TS: 'гроза без осадков',
        SQ: 'шквал',
        GR: 'град'
    }
};

const _propSequense = [
    {
        metarProp: 'wind',
        neededProps: [
            {
                name: 'speed_mps',
                prefix: 'Ветер',
                postfix: ' м/с'
            },
            {
                name: 'degrees',
                prefix: '',
                postfix: '°'
            }
        ]
    },
    {
        metarProp: 'visibility',
        neededProps: [
            {
                name: 'meters_float',
                prefix: 'Видимость',
                postfix: ' км'
            }
        ]
    },
    {
        metarProp: 'conditions',
        neededProps: [
            {
                name: 'code'
            }
        ]
    },
    {
        metarProp: 'clouds',
        neededProps: [
            {
                name: 'base_feet_agl',
                prefix: '',
                postfix: "'"
            },
            {
                name: 'code',
                prefix: '',
                postfix: ''
            }
        ]
    },
    {
        metarProp: 'temperature',
        neededProps: [
            {
                name: 'celsius',
                prefix: 'Температура воздуха',
                postfix: '°C'
            }
        ]
    },
    {
        metarProp: 'dewpoint',
        neededProps: [
            {
                name: 'celsius',
                prefix: 'Точка росы',
                postfix: ''
            }
        ]
    },
    {
        metarProp: 'barometer',
        neededProps: [
            {
                name: 'mb',
                prefix: 'Давление на уровне моря',
                postfix: ' ГПа'
            }
        ]
    }
];

fetchBtn.addEventListener('click', makeQuery);
codeInput.addEventListener('keyup', function (e) {
    if (e.which === 13) {
        makeQuery();
    }
});

function makeQuery() {
    console.clear();
    const query = ['metar', 'taf'];

    query.forEach((q) => {
        fetch(`${_apiUrls.checkwx}/${q}/${codeInput.value}/decoded`, {
            headers: {
                'x-api-key': _apiKeys.checkwx
            }
        })
            .then(res => res.json())
            .then(res => {
                const outputBlock = metarDecBlock.querySelector(' .info');
                const data = res.data[0];

                if (data) {
                    showInfo(true);
                    const weather = d.querySelector('.' + q + ' .info');
                    const airport = infoBlock.querySelector('.airport .info');

                    weather.textContent = data.raw_text;

                    const {name} = data.station;
                    const {icao} = data;
                    airport.textContent = `[${icao.toUpperCase()}] ${name}`;

                    // if (q === 'metar') outputBlock.textContent = metarDecr(data);
                    if (q === 'metar') outputBlock.textContent = metarDecr(testData);
                } else {
                    showInfo(false);
                }
            })
            .catch(e => {
                console.log(e);
                showInfo(false);
            });
    });
}

function showInfo(param) {
    if (param === true) {
        infoBlock.classList.remove('disabled');
        errorBlock.classList.add('disabled');
        metarDecBlock.classList.remove('disabled');
        metarDecBlock.classList.remove('disabled');
    } else {
        infoBlock.classList.add('disabled');
        errorBlock.classList.remove('disabled');
        metarDecBlock.classList.add('disabled');
        metarDecBlock.classList.add('disabled');
    }
}

function metarDecr(metar) {
    console.log(metar);

    let outputString = '';
    _propSequense.forEach((props) => {
        props.neededProps.forEach((prop) => {
            let target = '', localString = '', lastIndex = -1;
            const {prefix, postfix} = prop;
            const metarProp = props.metarProp;

            if (Array.isArray(metar[metarProp])) {
                lastIndex = metar[metarProp].length - 1;

                switch (metarProp) {
                    case 'clouds':
                        target = metar[metarProp][lastIndex][prop.name];
                        break;
                    case 'conditions':
                        if (metar[metarProp].length > 0) {
                            metar[metarProp].forEach(item => target += item.code)
                        }
                        break;
                }
            } else {
                target = metar[metarProp][prop.name];
            }

            if (prop.name) {
                switch (prop.name) {
                    case 'base_feet_agl':
                        break;
                    case 'code':
                        if (target === 'CAVOK') {
                            localString = `${_dictionary.clouds[target]}. `;
                        } else {
                            if (metarProp === 'clouds') {
                                localString = `облачность ${_dictionary.clouds[target]} на высоте ${metar[props.metarProp][lastIndex].base_feet_agl}'. `;
                            } else {
                                if (target !== '') {
                                    localString = `${_dictionary.conditions[target]}. `
                                }
                            }
                        }
                        break;
                    case 'meters_float':
                        target = target / 1000;
                        if (target === 10) target = 'более 10';
                        localString = metFormat(prefix, target, postfix);
                        break;
                    default:
                        localString = metFormat(prefix, target, postfix);
                        break;
                }
            }

            outputString += localString;
        });
    });

    function metFormat(x, y, z) {
        return `${x ? x + ' ' : ''}${y}${z ? z + '. ' : '. '}`
    }

    return outputString.toUpperCase();
}