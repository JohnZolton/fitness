function changetheme(){
    if (localStorage.getItem('theme') === 'darkmode') {
        settheme('lightmode');
        document.getElementById('switch').innerHTML = '&#x263E'
    } else {
        settheme('darkmode');
        document.getElementById('switch').innerHTML = '&#x263C'
    }
}

function settheme(theme){
    localStorage.setItem('theme', theme)
    document.documentElement.className= theme
}


(function (){
    if (localStorage.getItem('theme') === 'darkmode') {
        settheme('darkmode');
    } else {
        settheme('lightmode');
    }
})()