document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('lookup').addEventListener("submit", search);
})


function search(event) {
    let api = ''
    let url = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key='
    let suffix = '&query='
    let food = document.querySelector('#food').value;
    console.log(food)
    fetch(url + api + suffix + food)
    .then((response) => response.json())
    .then((data) => {
        for (let i = 0; i < data['foods'].length; i++)
        {
            console.log(data['foods'][i]['description'])
        }
        
    });
}