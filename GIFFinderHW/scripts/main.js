// 1
window.onload = (e) => {document.querySelector("#search").onclick = searchButtonClicked};
	
// 2
let displayTerm = "";

// 3
function searchButtonClicked(){
    console.log("searchButtonClicked() called");
    
    //1
    const GIPHY_URL = "https://api.giphy.com/v1/gifs/search?";

    //2
    let GIPHY_KEY = "z9Kd9uvgTbPCori85mfyjXTJVKdz0CLN";

    //3
    let url = GIPHY_URL;
    url+= "api_key=" + GIPHY_KEY;

    //4
    let term = document.querySelector("#searchterm").value;
    displayTerm = term;

    //5
    term = term.trim();

    //6
    term = encodeURIComponent(term);

    //7
    if(term.length < 1)return;

    //8
    url += "&q=" + term;

    //9
    let limit = document.querySelector("#limit").value;
    url+="&limit="+limit;

    //10
    document.querySelector("#status").innerHTML = "<b>Searching for '" + displayTerm + "'</b>";

    //11
    console.log(url);

    //12
    getData(url);
}

function getData(url){
    //1 - create a new XHR object
    let xhr = new XMLHttpRequest();

    //2
    xhr.onload = dataLoaded;

    //3
    xhr.onerror = dataError;

    //4
    xhr.open("GET",url);
    xhr.send();

}

//callback functions

function dataLoaded(e){
    //5
    let xhr = e.target;

    //6
    console.log(xhr.responseText);

    //7
    let obj = JSON.parse(xhr.responseText);

    //8
    if(!obj.data || obj.data.length == 0){
        document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'<b>";
        return;
    }

    //9
    let results = obj.data;
    console.log("results.length = " + results.length);
    let bigString = "";

    //10
    for(let i=0; i<results.length;i++){
        let result = results[i];

        //11
        let smallURL = result.images.fixed_width_downsampled.url;
        if(!smallURL) smallURL = "images/no-image-found.png";

        //12
        let url = result.url;

        //12.5
        let rating = (result.rating ? result.rating : "NA").toUpperCase();

        //13
        let line = `<div class='result'><img src='${smallURL}' title= '${result.id}'/>`;
        line += `<span><a target='_blank' href='${url}'>View on Giphy</a><p>Rating: ${rating}</p></span></div>`;

        //14 - Read and understood
        
        //15
        bigString += line;
    }

    //16
    document.querySelector("#content").innerHTML = bigString;

    //17
    document.querySelector("#status").innerHTML = "<b>Success!</b><p><i>Here are " + results.length + " results for '" + displayTerm + "'</i><p>";
}

function dataError(e){
    console.log("An error occured");
}
