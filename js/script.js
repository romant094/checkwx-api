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

                if (q === 'metar') console.log(data);

                if (data) {
                    showInfo(true);
                    const weather = d.querySelector('.' + q + ' .info');
                    const airport = infoBlock.querySelector('.airport .info');

                    weather.textContent = data.raw_text;

                    const {name} = data.station;
                    const {icao} = data;
                    airport.textContent = `[${icao.toUpperCase()}] ${name}`;

                    if (q === 'metar') outputBlock.textContent = metarDecr(data);
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
    let outputString = '';
    _propSequense.forEach((props) => {
        props.neededProps.forEach((prop) => {
            let target, localString = '';
            const {prefix, postfix} = prop;
            // console.log(prop);

            if (props.metarProp === 'clouds' || props.metarProp === 'conditions') {
                let lastIndex = metar[props.metarProp].length - 1;
                target = metar[props.metarProp][lastIndex][prop.name];
            } else {
                target = metar[props.metarProp][prop.name];
            }

            if (target && prop.name) {
                switch (prop.name) {
                    case 'base_feet_agl':
                        break;
                    case 'code':
                        if (target === 'CAVOK') {
                            localString = `${_dictionary.clouds[target]}. `;
                        } else {
                            localString = `облачность ${_dictionary.clouds[target]} на высоте ${metar[props.metarProp][0].base_feet_agl}'. `;
                        }
                        break;
                    case 'meters_float':
                        target = target / 1000;
                        if (target === 10) target = 'более 10';
                        localString = metFormat(prefix, target, postfix);
                        break;
                    default:
                        localString += metFormat(prefix, target, postfix);
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