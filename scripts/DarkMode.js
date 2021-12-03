var dark = false

function switchColours() {
    if(dark==false)
    {
        document.getElementById("iframe").src = "media/Resume.pdf"
        document.getElementById("stylesheet").href = "css/mycssDM.css"
        document.getElementById("DMbutton").innerHTML = "Toggle light mode"
        dark =true
    }
    else
    {
        document.getElementById("iframe").src = "media/Samar.Karnani%20Resume.pdf"
        document.getElementById("stylesheet").href = "css/mycss.css"
        document.getElementById("DMbutton").innerHTML = "Toggle dark mode"
        dark = false
    }
}
