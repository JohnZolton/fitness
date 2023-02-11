var counter = 1
const target = document.getElementById('food')
let today = new Date()
let dateOffset = 24*60*60*1000 // 1 day

var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('lookup').addEventListener("submit", search);
    document.getElementById('food').addEventListener("input", autocomplete)
    document.getElementById('food').addEventListener('blur', clearautocomplete)
    document.getElementById('prev').addEventListener('click', displayprevious)
    document.getElementById('next').addEventListener('click', displaynext)
    document.getElementById('copytotoday').addEventListener('click', copytotoday)
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

function copytotoday(){
    let csrf = getcookie('csrftoken');

    let selected_day = new Date(today - tzoffset).toISOString().slice(0,10)
    fetch('copytotoday', {
        method: 'POST',
        headers:{'X-CSRFToken': csrf},
        body: JSON.stringify({
            date: selected_day
        }),
      })
      .then(response => response.json())
      }


function displayprevious(){
    today.setTime(today.getTime() - dateOffset);
    changedisplay(today)
    document.getElementById('date').innerText = today.toLocaleDateString('en-US', {
        day : 'numeric',
        month : 'short',
        year : 'numeric'
    });

}

function displaynext(){
    today.setTime(today.getTime() + dateOffset);
    changedisplay(today)

    document.getElementById('date').innerText = today.toLocaleDateString('en-US', {
        day : 'numeric',
        month : 'short',
        year : 'numeric'
    });
}

function changedisplay(today){
    let selected_day = new Date(today - tzoffset).toISOString().slice(0,10)
    let dummy = new Date()
    if (new Date().toISOString().slice(0,10) == today.toISOString().slice(0,10)){
        document.getElementById('copytotoday').style.display= 'none'
        document.getElementById('copyprevious').style.display = 'block'
    } else {
        document.getElementById('copytotoday').style.display = 'block'
        document.getElementById('copyprevious').style.display = 'none'
    }
    // delete everything but the header of table
    let table = document.getElementById('totals-table')
    table.innerHTML = `
        <tr id="header">
        <th>Item</th>
        <th>Protein</th>
        <th>Carb</th>
        <th>Fat</th>
        <th>Fiber</th>
        <th>Calories</th>
        <th>Serving (g)</th>
        <th></th>
        <th></th>
    </tr>`
    
    let csrf = getcookie('csrftoken');
    fetch('displayprevious', {
        method: 'POST',
        headers:{'X-CSRFToken': csrf},
        body: JSON.stringify({
            date: selected_day
        }),
      })
      .then(response => response.json())
      .then(ans => {
        for (let i = 0; i < ans['response'].length; i++){
            let item = ans['response'][i][0]
            let protein_val = ans['response'][i][1]
            let carb_val = ans['response'][i][2]
            let fat_val = ans['response'][i][3]
            let fiber_val = ans['response'][i][4]
            let calorie_val = ans['response'][i][5]
            let serving = ans['response'][i][6]


            let newDiv = document.createElement("tr");
            newDiv.innerHTML = `
            <td class='saved-meal' id='${item}-name' data_original='${item}'>${item}</td>
            <td class='saved-meal' id='${item}-protein' data_original='${protein_val}'>${protein_val}</td>
            <td class='saved-meal' id='${item}-carbs' data_original='${carb_val}'>${carb_val}</td>
            <td class='saved-meal' id='${item}-fats' data_original='${fat_val}'>${fat_val}</td>
            <td class='saved-meal' id='${item}-fiber' data_original='${fiber_val}'>${fiber_val}</td>
            <td class='saved-meal' id='${item}-calories' data_original='${calorie_val}'>${calorie_val}</td>
            <td class='saved-meal' id='${item}-quantity' data_original='${serving}'>${serving}</td>
            <td>
              <button id='${item}-edit' class='edit-button' value='${item}'>edit</button>
              <button id="${item}-save" class="save-button" value="${item}" hidden>save</button>  
            </td>
            <td>
              <button id="${item}-remove" class="remove-button" value="${item}">remove</button>
            </td>`
      
            let row = document.getElementById("totals-table").getElementsByTagName('tbody')
            row[0].appendChild(newDiv)
      
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
        }

        resettotals()

        new_total_protein = ans['total_protein']
        new_total_carb = ans['total_carb']
        new_total_fat= ans['total_fat']
        new_total_fiber= ans['total_fiber']
        new_total_cals = ans['total_calories']
    
        updatetotals(new_total_protein, new_total_carb, new_total_fat, new_total_fiber, new_total_cals)
      });
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
    closeall()
   
    let api = document.getElementById('key').value
    let url = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key='
    let suffix = '&query='
    let food = document.querySelector('#food').value
    
    fetch(url + api + suffix + food)
    .then((response) => response.json())
    .then((data) => {
        for (let i = 0; i < data['foods'].length; i++)
        {
            let nutrients = ['203', '204', '205', '208', '291']
            let fooddata = data['foods'][i]['foodNutrients']
            let protein = 0
            let carbs = 0
            let fats = 0
            let cals = 0
            let fiber = 0
            let food_id = data['foods'][i]['finalFoodInputFoods']

            fooddata.forEach(element => {
                if (nutrients.includes(element['nutrientNumber'])){
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
    let logged_in = document.getElementById("is_logged_in").attributes.value.value
    if (logged_in == "True") {
    let serving = prompt('Serving size (g): ')
    var siblings = n => [...n.parentElement.children].filter(c=>c!=n)
    let info = siblings(this)

    let item = info[0].innerHTML
    let protein = info[1].innerHTML
    let carbs = info[3].innerHTML
    let fats = info[2].innerHTML
    let cals = info[5].innerHTML
    let fiber = info[4].innerHTML

    
    let current_day = new Date(today - tzoffset).toISOString().slice(0, 10)
    
    let portion_factor = serving / 100
    let protein_val = Math.round(protein*portion_factor)
    let carb_val = Math.round(carbs*portion_factor)
    let fat_val = Math.round(fats*portion_factor)
    let fiber_val = Math.round(fiber*portion_factor)
    let calorie_val = Math.round(cals*portion_factor)
    let csrf = getcookie('csrftoken');
    fetch('addfoods', {
        method: 'POST',
        headers:{'X-CSRFToken': csrf},
        body: JSON.stringify({
            item:item,
            protein:protein_val,
            carbs: carb_val,
            fat: fat_val,
            fiber: fiber_val,
            cals: calorie_val,
            serving:serving,
            date: current_day 
        }),
      })
      .then(response => response.json())
      
      let newDiv = document.createElement("tr");
      newDiv.innerHTML = `
      <td class='saved-meal' id='${item}-name' data_original='${item}'>${item}</td>
      <td class='saved-meal' id='${item}-protein' data_original='${protein_val}'>${protein_val}</td>
      <td class='saved-meal' id='${item}-carbs' data_original='${carb_val}'>${carb_val}</td>
      <td class='saved-meal' id='${item}-fats' data_original='${fat_val}'>${fat_val}</td>
      <td class='saved-meal' id='${item}-fiber' data_original='${fiber_val}'>${fiber_val}</td>
      <td class='saved-meal' id='${item}-calories' data_original='${calorie_val}'>${calorie_val}</td>
      <td class='saved-meal' id='${item}-quantity' data_original='${serving}'>${serving}</td>
      <td>
        <button id='${item}-edit' class='edit-button' value='${item}'>edit</button>
        <button id="${item}-save" class="save-button" value="${item}" hidden>save</button>  
      </td>
      <td>
        <button id="${item}-remove" class="remove-button" value="${item}">remove</button>
      </td>`

      let row = document.getElementById("totals-table").getElementsByTagName('tbody')
      row[0].appendChild(newDiv)

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
      
      let new_total_protein = parseInt(protein_val)
      let new_total_carb = parseInt(carb_val)
      let new_total_fat = parseInt(fat_val)
      let new_total_fiber = parseInt(fiber_val)
      let new_total_cals = parseInt(calorie_val)
  
    updatetotals(new_total_protein, new_total_carb, new_total_fat, new_total_fiber, new_total_cals)
    
    hideresults(document.getElementById('display-table'))
    document.getElementById('display-table').style.display = 'none'
    document.getElementById('food').value = ''
    } else {alert("please create an account or sign in")}
}

function editfoods() {
    let id = this.attributes.value.value
    
    this.parentElement.parentElement.childNodes.item(13)
    quant = this.parentElement.parentElement.childNodes.item(13)
    
    let old_val = quant.innerText
    quant.innerHTML = `
        <input type='number' value='${old_val}' data_id='${id}'>
    `
    quant.addEventListener('input', changevalues)

    this.style.display = 'none'
    this.parentElement.parentElement.childNodes.item(15).lastElementChild.style.display='block'
}

function changevalues() {
    let id = this.firstElementChild.attributes.data_id.value
    let oldval = this.attributes.data_original.value
    let newval = this.firstElementChild.value
    
    let factor = newval / oldval

    this.parentElement.childNodes.item(3)

    let protein = this.parentElement.childNodes.item(3)
    let carbs = this.parentElement.childNodes.item(5)
    let fats = this.parentElement.childNodes.item(7)
    let fiber = this.parentElement.childNodes.item(9)
    let cals = this.parentElement.childNodes.item(11)

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

    let protein = this.parentElement.parentElement.children.item(1)
    let carbs = this.parentElement.parentElement.children.item(2)
    let fats = this.parentElement.parentElement.children.item(3)
    let fiber = this.parentElement.parentElement.children.item(4)
    let cals = this.parentElement.parentElement.children.item(5)
    let serving = this.parentElement.parentElement.children.item(6)

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
    this.parentElement.parentElement.childNodes.item(15).firstElementChild.style.display = 'block'
    this.parentElement.parentElement.childNodes.item(15).lastElementChild.style.display='none'
    //ocument.getElementById(`${id}-edit`).style.display='block'
    serving.innerHTML = new_serving

    let new_total_protein = parseInt(new_protein) - parseInt(old_protein)
    let new_total_carb =  parseInt(new_carb) - parseInt(old_carbs)
    let new_total_fat =  parseInt(new_fat) - parseInt(old_fats)
    let new_total_fiber = parseInt(new_fiber) - parseInt(old_fiber)
    let new_total_cals = parseInt(new_cals) - parseInt(old_cals)
    updatetotals(new_total_protein, new_total_carb, new_total_fat, new_total_fiber, new_total_cals)
    let current_day = new Date(today -tzoffset).toISOString().slice(0,10)
    let csrf = getcookie('csrftoken');
    fetch('editfoods', {
        method: 'POST',
        headers:{'X-CSRFToken': csrf},
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
            old_serving: old_serving,
            date: current_day
        }),
      })
      .then(response => response.json())
}

function updatevalues(info){
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
    let id = this.attributes.value.value

    let current_day = new Date(today -tzoffset).toISOString().slice(0,10)
    let item = document.getElementById(`${id}-name`).innerText
    let serving = document.getElementById(`${id}-quantity`).innerText
    let protein_val = document.getElementById(`${id}-protein`).innerText
    let carb_val = document.getElementById(`${id}-carbs`).innerText
    let fat_val = document.getElementById(`${id}-fats`).innerText
    let fiber_val = document.getElementById(`${id}-fiber`).innerText
    let calorie_val = document.getElementById(`${id}-calories`).innerText
    let csrf = getcookie('csrftoken');
    fetch('removefood', {
        method: 'POST',
        headers:{'X-CSRFToken': csrf},
        body: JSON.stringify({
            item: item,
            protein: protein_val,
            carbs: carb_val,
            fat: fat_val,
            fiber: fiber_val,
            cals: calorie_val,
            serving: serving,
            date: current_day 
        }),
      })
      .then(response => response.json())
      this.parentElement.parentElement.remove()

      let new_total_protein = -parseInt(protein_val)
      let new_total_carb =-parseInt(carb_val)
      let new_total_fat = -parseInt(fat_val)
      let new_total_fiber = -parseInt(fiber_val)
      let new_total_cals = -parseInt(calorie_val)

      updatetotals(new_total_protein, new_total_carb, new_total_fat, new_total_fiber, new_total_cals)
}


function getcookie(name) {
    let cookievalue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookievalue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookievalue;
}

function updatetotals(protein, carb, fat, fiber, calories){
        
    let protein_total = document.getElementById('total-protein')
    let carb_total = document.getElementById('total-carbs')
    let fat_total = document.getElementById('total-fat')
    let fiber_total = document.getElementById('total-fiber')
    let calorie_total = document.getElementById('total-cals')

    let protein_goal = protein_total.attributes.data_goal.value
    let carb_goal = carb_total.attributes.data_goal.value
    let fat_goal = fat_total.attributes.data_goal.value
    let calorie_goal = calorie_total.attributes.data_goal.value
    let fiber_goal = fiber_total.attributes.data_goal.value

    new_total_protein = parseInt(protein_total.attributes.data_current.value) + parseInt(protein)
    new_total_carb = parseInt(carb_total.attributes.data_current.value) + parseInt(carb)
    new_total_fat = parseInt(fat_total.attributes.data_current.value) + parseInt(fat)
    new_total_fiber = parseInt(fiber_total.attributes.data_current.value) + parseInt(fiber)
    new_total_cals = parseInt(calorie_total.attributes.data_current.value) + parseInt(calories)
   

    protein_total.innerText = `Protein: ${new_total_protein}/${protein_goal}`
    carb_total.innerText = `Carbs: ${new_total_carb}/${carb_goal}`
    fat_total.innerText = `Fat: ${new_total_fat}/${fat_goal}`
    fiber_total.innerText = `Fiber: ${new_total_fiber}/${fiber_goal}`
    calorie_total.innerText = `Calories: ${new_total_cals}/${calorie_goal}`

    protein_total.attributes.data_current.value = new_total_protein
    carb_total.attributes.data_current.value = new_total_carb
    fat_total.attributes.data_current.value = new_total_fat
    fiber_total.attributes.data_current.value = new_total_fiber
    calorie_total.attributes.data_current.value = new_total_cals

    document.getElementById('protein-progress').attributes.value.value = new_total_protein
    document.getElementById('carb-progress').attributes.value.value = new_total_carb
    document.getElementById('fat-progress').attributes.value.value = new_total_fat
    document.getElementById('fiber-progress').attributes.value.value = new_total_fiber
    document.getElementById('calorie-progress').attributes.value.value = new_total_cals
}

function resettotals(){
    let protein_total = document.getElementById('total-protein')
    let carb_total = document.getElementById('total-carbs')
    let fat_total = document.getElementById('total-fat')
    let fiber_total = document.getElementById('total-fiber')
    let calorie_total = document.getElementById('total-cals')

    let protein = -parseInt(protein_total.attributes.data_current.value)
    let carb = -parseInt(carb_total.attributes.data_current.value)
    let fat = -parseInt(fat_total.attributes.data_current.value)
    let fiber = -parseInt(fiber_total.attributes.data_current.value)
    let calories = -parseInt(calorie_total.attributes.data_current.value)
    updatetotals(protein, carb, fat, fiber, calories)
}