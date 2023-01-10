document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('lookup').addEventListener("submit", search);
})


function search(event) {
    hidechildren(document.getElementById('display-table'))
   

    let api = ''
    let url = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key='
    let suffix = '&query='
    let food = document.querySelector('#food').value;
    
    fetch(url + api + suffix + food)
    .then((response) => response.json())
    .then((data) => {
        for (let i = 0; i < data['foods'].length; i++)
        {
            //console.log(data['foods'][i]['foodNutrients'])
            let nutrients = ['203', '204', '205', '208', '291']
            let fooddata = data['foods'][i]['foodNutrients']
            console.log(data['foods'][i])
            let protein = 0
            let carbs = 0
            let fats = 0
            let cals = 0
            let food_id = data['foods'][i]['finalFoodInputFoods']
            food_id.forEach(element => {
                console.log(element['foodDescription'] + 'id: ' + element['id'])
            })

            fooddata.forEach(element => {
                if (nutrients.includes(element['nutrientNumber'])){
                    //console.log(element['nutrientName'], element['value'], element['unitName'])
                    if (element['nutrientNumber']=='203'){protein = element['value']}
                    if (element['nutrientNumber']=='204'){carbs = element['value']}
                    if (element['nutrientNumber']=='205'){fats = element['value']}
                    if (element['nutrientNumber']=='208'){cals = element['value']}
                    if (element['nutrientNumber']=='291'){fiber = element['value']}
                }
            });
            let newDiv = document.createElement("tr");
            newDiv.innerHTML = `
            <td>${data['foods'][i]['description']}</td>
            <td>${protein}</td>
            <td>${carbs}</td>
            <td>${fats}</td>
            <td>${cals}</td>
            <td>${fiber}</td>`

            document.getElementById("display-table").appendChild(newDiv)
        }
        
    });
}

function hidechildren(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }
    
    let newDiv = document.createElement("tr");
    newDiv.innerHTML = `
    <th>Food</th>
    <th>Protein</th>
    <th>Fats</th>
    <th>Carbs</th>
    <th>Calories</th>
    <th>Fiber</th>`

    document.getElementById("display-table").appendChild(newDiv)
}