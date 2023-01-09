document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('form').onsubmit = search();
})

function search() {
    console.log('yes')
    let api = ''
    let url = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key='
    let suffix = '&query='
    let food = document.querySelector('#food').value
    fetch(url + api + suffix + food)
    .then((response) => response.json())
    .then((data) => console.log(data));
}