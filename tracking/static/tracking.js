var counter = 1
const target = document.getElementById('food')

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('lookup').addEventListener("submit", search);
    document.getElementById('save-meal').addEventListener("submit", hideresults);
    document.getElementById('food').addEventListener("input", autocomplete)
    document.getElementById('food').addEventListener('blur', clearautocomplete)
})

function clearautocomplete(){
    setTimeout(() => {
        closeall()
    }, 200);
}


function autocomplete(event){
    let api = document.getElementById('key').value
    let url = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key='
    let suffix = '&query='
    let food = document.querySelector('#food').value
    
    if (document.getElementById('foodautocomplete-list')){
        document.getElementById('foodautocomplete-list').innerHTML=""
    }


    newdiv = document.createElement("DIV");
    newdiv.setAttribute("id", this.id + "autocomplete-list");
    newdiv.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(newdiv);

    fetch(url + api + suffix + food)
    .then((response) => response.json())
    .then((data) => {
        for (let i = 0; i < data['foods'].length; i++)
        {
            let food = data['foods'][i]

            search_res = document.createElement("DIV")
            search_res.innerHTML = `${food['description']}`
            search_res.innerHTML += `<input type="hidden" value=${food['description']}>`
            search_res.addEventListener('click', function(){
                console.log(this.innerText)
                document.getElementById('food').value = this.innerText
                search()
                closeall()
                newdiv.innerHTML=''
            })
            newdiv.appendChild(search_res)
        }
        
    }); 
}

function closeall(){
    var list = document.getElementsByClassName("autocomplete-items");
    for(var i = list.length - 1; 0 <= i; i--)
        if(list[i] && list[i].parentElement)
        list[i].parentElement.removeChild(list[i]);
}

function search(event) {
    hideresults(document.getElementById('display-table'))
   
    let api = document.getElementById('key').value
    let url = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key='
    let suffix = '&query='
    let food = document.querySelector('#food').value
    
    fetch(url + api + suffix + food)
    .then((response) => response.json())
    .then((data) => {
        for (let i = 0; i < data['foods'].length; i++)
        {
            //console.log(data['foods'][i]['foodNutrients'])
            let nutrients = ['203', '204', '205', '208', '291']
            let fooddata = data['foods'][i]['foodNutrients']
            //console.log(data['foods'][i])
            let protein = 0
            let carbs = 0
            let fats = 0
            let cals = 0
            let food_id = data['foods'][i]['finalFoodInputFoods']
            food_id.forEach(element => {
                //console.log(element['foodDescription'] + 'id: ' + element['id'])
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
            <td>${fiber}</td>
            <td>${cals}</td>
            <button id='${data['foods'][i]['fdcId']}'>Add</button>`

            document.getElementById("display-table").appendChild(newDiv)
            document.getElementById(`${data['foods'][i]['fdcId']}`).addEventListener('click', addfood)
        }
        
    });
}

function addfood(){
    let serving = prompt('Serving size (g): ')
    var siblings = n => [...n.parentElement.children].filter(c=>c!=n)
    let info = siblings(this)

    let item = info[0].innerHTML
    let protein = info[1].innerHTML
    let carbs = info[3].innerHTML
    let fats = info[2].innerHTML
    let cals = info[5].innerHTML
    let fiber = info[4].innerHTML
    
    portion_factor = serving / 100
    let newitem = document.createElement('tr')
    newitem.innerHTML=`
    <td>${item}</td>
    <td id='protein'>${Math.round(protein*portion_factor)}</td>
    <td id='carb'>${Math.round(carbs*portion_factor)}</td>
    <td id='fat'>${Math.round(fats*portion_factor)}</td>
    <td id='fiber'>${Math.round(fiber*portion_factor)}</td>
    <td id='calories'>${Math.round(cals*portion_factor)}</td>
    <td id='${item.id}-serving'><input type='number' onSubmit='return false' value='${serving}'></td>
    <td><input type='button' id='${item}'  value='Remove'></td>
    <input type='hidden' value='${item};${Math.round(protein*portion_factor)};${Math.round(carbs*portion_factor)};${Math.round(fats*portion_factor)};${Math.round(fiber*portion_factor)};${Math.round(cals*portion_factor)};${serving}' name='${counter}'>`

    document.getElementById('meal-table-div').style.display = 'block'
    document.getElementById('meal-table').appendChild(newitem)
    document.getElementById(`${item}`).addEventListener('click', removeselection)
    counter ++
    hideresults(document.getElementById('display-table'))
    document.getElementById('food').value = ''
    document.getElementById(`${item.id}-serving`).addEventListener('change', updatevalues(info))
    
}

function updatevalues(info){
    console.log('updatevalues fired')
    console.log(info)
}

function removeselection(){
    console.log(this.id)
    let serving = document.getElementById(`${this.id}-serving`)
    let size = serving.value
    return false
}

function hideresults(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }
    
    let newDiv = document.createElement("tr");
    newDiv.innerHTML = `
    <th>Food</th>
    <th>Protein</th>
    <th>Fats</th>
    <th>Carbs</th>
    <th>Fiber</th>
    <th>Calories</th>`

    document.getElementById("display-table").appendChild(newDiv)
}