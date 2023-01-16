var counter = 1
const target = document.getElementById('food')

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('lookup').addEventListener("submit", search);
    document.getElementById('food').addEventListener("input", autocomplete)
    document.getElementById('food').addEventListener('blur', clearautocomplete)
    let editbuttons = document.querySelectorAll('.edit-button')
    console.log(editbuttons)
    editbuttons.forEach(child => {
        child.addEventListener('click', editfoods)
      })
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
            let fiber = 0
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
    
    let portion_factor = serving / 100
    let = protein_val = Math.round(protein*portion_factor)
    let = carb_val = Math.round(carbs*portion_factor)
    let = fat_val = Math.round(fats*portion_factor)
    let = fiber_val = Math.round(fiber*portion_factor)
    let = calorie_val = Math.round(cals*portion_factor)

    let nutrition = `${item};${protein_val};${carb_val};${fat_val};${fiber_val};${calorie_val}`
    //console.log(nutrition)
    
    fetch('addfoods', {
        method: 'POST',
        body: JSON.stringify({
            item:item,
            protein:protein_val,
            carbs: carb_val,
            fat: fat_val,
            fiber: fiber_val,
            cals: calorie_val,
            serving:serving
        }),
      })
      .then(response => response.json())
      .then(ans => console.log(ans));
      
      let newDiv = document.createElement("tr");
      newDiv.innerHTML = `
      <td>${item}</td>
      <td>${protein_val}</td>
      <td>${carb_val}</td>
      <td>${fat_val}</td>
      <td>${fiber_val}</td>
      <td>${calorie_val}</td>
      <td>${serving}</td>
      <button id='${item}-edit' class='edit-button'>edit</button>`

      document.getElementById("totals-table").appendChild(newDiv)
      document.getElementById(`${item}-edit`).addEventListener('click', editfoods)

    hideresults(document.getElementById('display-table'))
    document.getElementById('food').value = ''
}

function editfoods() {
    let id = this.attributes.value.value
    //old_serving = document.querySelector
    quant = document.getElementById(`${id}-quantity`)
    quant.innerHTML = `
        <input type='number' value=>
    `
}

function updatevalues(info){
    console.log('updatevalues fired')
    let id = this.parentElement.firstElementChild.innerText
    let newserving = this.firstChild.value

    let protein = document.getElementById(`${id}-protein`)
    let carbs = document.getElementById(`${id}-carb`)
    let fats = document.getElementById(`${id}-fat`)
    let fiber = document.getElementById(`${id}-fiber`)
    let cals = document.getElementById(`${id}-calories`)
    let sub_data = document.getElementById(`${id}-submissions`)


    factor = newserving / 100
    newprotein = Math.round(protein.attributes.value.value * factor)
    newcarb = Math.round(carbs.attributes.value.value * factor)
    newfat = Math.round(fats.attributes.value.value * factor)
    newfiber = Math.round(fiber.attributes.value.value * factor)
    newcals = Math.round(cals.attributes.value.value * factor)
    
    protein.innerText = newprotein
    carbs.innerText = newcarb
    fats.innerText = newfat
    fiber.innerText = newfiber
    cals.innerText = newcals

    sub_data.attributes.value.value = `${id};${newprotein};${newcarb};${newfat};${newfiber};${newcals};${newserving}`
    

}

function removeselection(){
    console.log(this.parentElement.parentElement)
    this.parentElement.parentElement.remove()
    
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