var counter = 1
const target = document.getElementById('food')

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('lookup').addEventListener("submit", search);
    document.getElementById('food').addEventListener("input", autocomplete)
    document.getElementById('food').addEventListener('blur', clearautocomplete)
    let editbuttons = document.querySelectorAll('.edit-button')

    editbuttons.forEach(child => {
        child.addEventListener('click', editfoods)
      })
    let savebuttons = document.querySelectorAll('.save-button')

      savebuttons.forEach(child => {
          child.addEventListener('click', savechanges)
        })
    let removebuttons = document.querySelectorAll('.remove-button')
        removebuttons.forEach(child => {
            child.addEventListener('click', removeitem)
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
      <td class='saved-meal' id='${item}-name' data_original='${item}'>${item}</td>
      <td class='saved-meal' id='${item}-protein' data_original='${protein_val}'>${protein_val}</td>
      <td class='saved-meal' id='${item}-carbs' data_original='${carb_val}'>${carb_val}</td>
      <td class='saved-meal' id='${item}-fats' data_original='${fat_val}'>${fat_val}</td>
      <td class='saved-meal' id='${item}-fiber' data_original='${fiber_val}'>${fiber_val}</td>
      <td class='saved-meal' id='${item}-calories' data_original='${calorie_val}'>${calorie_val}</td>
      <td class='saved-meal' id='${item}-quantity' data_original='${serving}'>${serving}</td>
      <button id='${item}-edit' class='edit-button' value='${item}'>edit</button>
      <button id="${item}-save" class="save-button" value="${item}" hidden>save</button>
      <button id="${item}-remove" class="remove-button" value="${item}">remove</button>`

      document.getElementById("totals-table").appendChild(newDiv)
      document.getElementById(`${item}-edit`).addEventListener('click', editfoods)
      document.getElementById(`${item}-save`).addEventListener('click', savechanges)
      document.getElementById(`${item}-remove`).addEventListener('click', removeitem)

      let protein_total = document.getElementById('total-protein')
      let carb_total = document.getElementById('total-carbs')
      let fat_total = document.getElementById('total-fat')
      let fiber_total = document.getElementById('total-fiber')
      let calorie_total = document.getElementById('total-cals')

      let protein_current = protein_total.attributes.data_current.value
      let carb_current = carb_total.attributes.data_current.value
      let fat_current = fat_total.attributes.data_current.value
      let fiber_current = fiber_total.attributes.data_current.value
      let calorie_current = calorie_total.attributes.data_current.value

      let protein_goal = protein_total.attributes.data_goal.value
      let carb_goal = carb_total.attributes.data_goal.value
      let fat_goal = fat_total.attributes.data_goal.value
      let calorie_goal = calorie_total.attributes.data_goal.value
      
      let new_total_protein = parseInt(protein_current) + parseInt(protein_val)
      let new_total_carb = parseInt(carb_current) + parseInt(carb_val)
      let new_total_fat = parseInt(fat_current) + parseInt(fat_val)
      let new_total_fiber = parseInt(fiber_current) + parseInt(fiber_val)
      let new_total_cals = parseInt(calorie_current) + parseInt(calorie_val)
  
      protein_total.innerText = `Protein: ${new_total_protein}/${protein_goal}`
      carb_total.innerText = `Carbs: ${new_total_carb}/${carb_goal}`
      fat_total.innerText = `Fat: ${new_total_fat}/${fat_goal}`
      fiber_total.innerText = `Fiber: ${new_total_fiber}`
      calorie_total.innerText = `Calories: ${new_total_cals}/${calorie_goal}`
  
      protein_total.attributes.data_current.value = new_total_protein
      carb_total.attributes.data_current.value = new_total_carb
      fat_total.attributes.data_current.value = new_total_fat
      fiber_total.attributes.data_current.value = new_total_fiber
      calorie_total.attributes.data_current.value = new_total_cals


    hideresults(document.getElementById('display-table'))
    document.getElementById('food').value = ''
}

function editfoods() {
    let id = this.attributes.value.value
    
    //old_serving = document.querySelector
    quant = document.getElementById(`${id}-quantity`)
    
    let old_val = quant.innerText
    quant.innerHTML = `
        <input type='number' value='${old_val}' data_id='${id}'>
    `
    quant.addEventListener('input', changevalues)

    this.style.display = 'none'
    document.getElementById(`${id}-save`).style.display='block'
}

function changevalues() {
    let id = this.firstElementChild.attributes.data_id.value
    let oldval = this.attributes.data_original.value
    let newval = this.firstElementChild.value
    
    let factor = newval / oldval

    let protein = document.getElementById(`${id}-protein`)
    let carbs = document.getElementById(`${id}-carbs`)
    let fats = document.getElementById(`${id}-fats`)
    let fiber = document.getElementById(`${id}-fiber`)
    let cals = document.getElementById(`${id}-calories`)
    //console.log(protein, carbs, fats, fiber, cals)
    newprotein = Math.round(protein.attributes.data_original.value * factor)
    newcarb = Math.round(carbs.attributes.data_original.value * factor)
    newfat = Math.round(fats.attributes.data_original.value * factor)
    newfiber = Math.round(fiber.attributes.data_original.value * factor)
    newcals = Math.round(cals.attributes.data_original.value * factor)
    
    protein.innerText = newprotein
    carbs.innerText = newcarb
    fats.innerText = newfat
    fiber.innerText = newfiber
    cals.innerText = newcals
}

function savechanges() {
    let id = this.attributes.value.value
    let protein = document.getElementById(`${id}-protein`)
    let carbs = document.getElementById(`${id}-carbs`)
    let fats = document.getElementById(`${id}-fats`)
    let fiber = document.getElementById(`${id}-fiber`)
    let cals = document.getElementById(`${id}-calories`)
    let serving = document.getElementById(`${id}-quantity`)

    let old_protein = protein.attributes.data_original.value
    let old_carbs = carbs.attributes.data_original.value
    let old_fats = fats.attributes.data_original.value
    let old_fiber = fiber.attributes.data_original.value
    let old_cals = cals.attributes.data_original.value
    let old_serving = serving.attributes.data_original.value

    let new_protein = protein.innerText
    let new_carb = carbs.innerText
    let new_fat = fats.innerText
    let new_fiber = fiber.innerText
    let new_cals = cals.innerText
    let new_serving = serving.firstElementChild.value
    
    this.style.display = 'none'
    document.getElementById(`${id}-edit`).style.display='block'
    document.getElementById(`${id}-quantity`).innerHTML = new_serving

    let protein_total = document.getElementById('total-protein')
    let carb_total = document.getElementById('total-carbs')
    let fat_total = document.getElementById('total-fat')
    let fiber_total = document.getElementById('total-fiber')
    let calorie_total = document.getElementById('total-cals')
    

    let protein_goal = protein_total.attributes.data_goal.value
    let carb_goal = carb_total.attributes.data_goal.value
    let fat_goal = fat_total.attributes.data_goal.value
    let calorie_goal = calorie_total.attributes.data_goal.value

    let protein_current = protein_total.attributes.data_current.value
    let carb_current = carb_total.attributes.data_current.value
    let fat_current = fat_total.attributes.data_current.value
    let fiber_current = fiber_total.attributes.data_current.value
    let calorie_current = calorie_total.attributes.data_current.value
    
    let new_total_protein = parseInt(protein_current) + parseInt(new_protein) - parseInt(old_protein)
    let new_total_carb = parseInt(carb_current) + parseInt(new_carb) - parseInt(old_carbs)
    let new_total_fat = parseInt(fat_current) + parseInt(new_fat) - parseInt(old_fats)
    let new_total_fiber = parseInt(fiber_current) + parseInt(new_fiber) - parseInt(old_fiber)
    let new_total_cals = parseInt(calorie_current) + parseInt(new_cals) - parseInt(old_cals)

    protein_total.innerText = `Protein: ${new_total_protein}/${protein_goal}`
    carb_total.innerText = `Carbs: ${new_total_carb}/${carb_goal}`
    fat_total.innerText = `Fat: ${new_total_fat}/${fat_goal}`
    fiber_total.innerText = `Fiber: ${new_total_fiber}`
    calorie_total.innerText = `Calories: ${new_total_cals}/${calorie_goal}`

    protein_total.attributes.data_current.value = new_total_protein
    carb_total.attributes.data_current.value = new_total_carb
    fat_total.attributes.data_current.value = new_total_fat
    fiber_total.attributes.data_current.value = new_total_fiber
    calorie_total.attributes.data_current.value = new_total_cals

    fetch('editfoods', {
        method: 'POST',
        body: JSON.stringify({
            item:id,
            protein: new_protein,
            carbs: new_carb,
            fat: new_fat,
            fiber: new_fiber,
            cals: new_cals,
            serving: new_serving,
            old_protein: old_protein,
            old_carbs: old_carbs,
            old_fat: old_fats,
            old_fiber: old_fiber,
            old_cals: old_cals,
            old_serving: old_serving
        }),
      })
      .then(response => response.json())
      .then(ans => console.log(ans));
}

function updatevalues(info){
    console.log('updatevalues fired')
    let id = this.parentElement.firstElementChild.innerText
    let newserving = this.firstChild.value

    let protein = document.getElementById(`${id}-protein`)
    let carbs = document.getElementById(`${id}-carbs`)
    let fats = document.getElementById(`${id}-fats`)
    let fiber = document.getElementById(`${id}-fiber`)
    let cals = document.getElementById(`${id}-calories`)
    //let sub_data = document.getElementById(`${id}-submissions`)


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

function removeitem(){
    console.log('TODO: remove item')
}