document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#submit').addEventListener('click', lookupfood);
})

function lookupfood() {
    console.log('form clicked')
    let food = document.querySelector('#food').value;
    console.log(food)
    return false;
}