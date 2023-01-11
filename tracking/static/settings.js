document.addEventListener('DOMContentLoaded', function() {
    let buttons = document.querySelectorAll('input')
    buttons.forEach(function(elem) {
        elem.addEventListener("input", update)
})})

function update(){
    let carb = document.getElementById('carb').value * 4
    let protein = document.getElementById('protein').value * 4
    let fat = document.getElementById('fat').value * 9
    console.log(carb+protein+fat)
    document.getElementById('calories').innerText = `Calories: ${carb+protein+fat}`
    document.getElementById('true-calories').value = `${carb+protein+fat}`
}