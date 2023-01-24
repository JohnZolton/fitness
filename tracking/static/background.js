function changetheme(){
    if (localStorage.getItem('theme') === 'darkmode') {
        settheme('lightmode');
    } else {
        settheme('darkmode');
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