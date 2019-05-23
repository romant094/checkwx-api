const d = document,
    fetchBtn = d.querySelector('#fetch-btn'),
    infoBlock = d.querySelector('.information'),
    errorBlock = d.querySelector('.error');

const _url = 'https://api.checkwx.com';
const _apiKey = 'ef56bcec85ea6dc0afbe008abc';

fetchBtn.addEventListener('click', makeQuery);

function makeQuery() {
    const code = d.querySelector('#airport-id').value;
    const query = ['metar', 'taf'];

    query.forEach((q) => {
        fetch(`${_url}/${q}/${code}/decoded`, {
            headers: {
                'x-api-key': _apiKey
            }
        })
            .then(res => res.json())
            .then((res) => {
                const data = res.data[0];

                console.log(data);

                if (data) {
                    showInfo(true);
                    const weather = d.querySelector('.' + q + ' .info');
                    const airport = infoBlock.querySelector('.airport .info');

                    weather.textContent = data.raw_text;

                    airport.textContent = `[${data.icao.toUpperCase()}] ${data.station.name}`;
                } else {
                    showInfo(false);
                }
            })
            .catch(e => {
                console.log(e);
            });
    });
}

function showInfo(param) {
    if (param === true) {
        infoBlock.classList.remove('disabled');
        errorBlock.classList.add('disabled');
    } else {
        infoBlock.classList.add('disabled');
        errorBlock.classList.remove('disabled');
    }
}