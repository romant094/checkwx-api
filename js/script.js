const d = document,
    fetchBtn = d.querySelector('#fetch-btn');

const _url = 'https://api.checkwx.com';
const _apiKey = 'ef56bcec85ea6dc0afbe008abc';

fetchBtn.addEventListener('click', makeQuery);

function makeQuery() {
    const code = d.querySelector('#airport-id').value;
    const query = ['metar', 'taf'];

    query.forEach((q) => {
        fetch(`${_url}/${q}/${code}`, {
            headers: {
                'x-api-key': _apiKey
            }
        })
            .then(res => res.json())
            .then((res) => {
                const data = res.data[0];
                d.querySelector('.' + q).textContent = data;
            })
            .catch(e => {
                console.log(e);
            });
    });
}