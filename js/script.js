const d = document,
    fetchBtn = d.querySelector('#fetch-btn'),
    infoBlock = d.querySelector('.information'),
    errorBlock = d.querySelector('.error'),
    codeInput = d.querySelector('#airport-id'),
    metarDecBlock = d.querySelector('.metar-decryption');

const _apiUrls = {
    yandex: 'https://translate.yandex.net/api/v1.5/tr.json/translate',
    checkwx: 'https://api.checkwx.com'
};
const _apiKeys = {
    yandex: 'trnsl.1.1.20190524T141447Z.0213b37ed61910ce.e7ba9c225b0757bc761e59234afb437f37c8fefb',
    checkwx: 'ef56bcec85ea6dc0afbe008abc'
};
const _runwayInfo = {};

fetchBtn.addEventListener('click', makeQuery);
codeInput.addEventListener('keyup', function (e) {
    if (e.which === 13) {
        makeQuery();
    }
});

function makeQuery() {
    const query = ['metar', 'taf'];

    query.forEach((q) => {
        fetch(`${_apiUrls.checkwx}/${q}/${codeInput.value}/decoded`, {
            headers: {
                'x-api-key': _apiKeys.checkwx
            }
        })
            .then(res => res.json())
            .then(res => {
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
                } else {
                    showInfo(false);
                }

                metarDecr(data);
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
    } else {
        infoBlock.classList.add('disabled');
        errorBlock.classList.remove('disabled');
        metarDecBlock.classList.add('disabled');
    }
}

function metarDecr(metar) {
    for (prop in metar) {
        const metarInfo = metarDecBlock.querySelector(`.${prop} .metar-info`);
        let textValue;

        if (metarInfo) {
            switch (prop) {
                case 'observed':
                    const time = new Date(metar[prop]);
                    translate(time.toUTCString().toLowerCase(), metarInfo);
                    break;
                case 'wind':
                    const {degrees, speed_mps} = metar[prop];
                    textValue = `направление: ${degrees}°, скорость: ${speed_mps} м/с`;
                    break;
                case 'temperature':
                    const {celsius: temp} = metar[prop];
                    const {celsius: dew} = metar.dewpoint;
                    textValue = `${temp}°C / ${dew}°C`;
                    break;
                case 'barometer':
                    const {mb} = metar[prop];
                    textValue = `${mb} ГПа`;
                    break;
                case 'visibility':
                    const {meters_float: meters} = metar[prop];
                    textValue = `${meters} м`;
                    break;
                case 'clouds':
                    const {code, text} = metar[prop][0];
                    translate(text, metarInfo);
                    break;
                case 'humidity':
                    const {percent} = metar[prop];
                    textValue = `${percent}%`;
                    break;
                default:
                    console.log(`${prop} не обработано`);
            }
            metarInfo.textContent = textValue;
        }

    }
}

function translate(text, field) {
    fetch(`${_apiUrls.yandex}?key=${_apiKeys.yandex}&text=${text}&lang=ru&format=plain&options=1`)
        .then(res => res.json())
        .then(res => {
            field.textContent = res.text[0].toLowerCase();
        })
        .catch(e => {
            console.log(e);
            field.textContent = 'Информация временно недоступна'
        });
}