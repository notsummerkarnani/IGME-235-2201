// 1
window.onload = (e) => {document.querySelector("#searchButton").onclick = searchButtonClicked
                        document.querySelector("#dateRange").onchange = SearchRange
                        document.querySelector("#dateSpec").onchange = SearchSpec

                        if(localStorage.srk7473Country){
                            //console.log("OK")
                            document.querySelector("#searchterm").value = localStorage.getItem("srk7473Country");
                        }
                        if(localStorage.srk7473Flag){
                            //console.log("OK")
                            document.querySelector("#Flag").innerHTML = localStorage.getItem("srk7473Flag");                        }
                        }
	
// 2
let displayTerm = "";
let rangedSearch = false;
let alpha3;


// 3
function searchButtonClicked(){
    //console.log("searchButtonClicked() called");

    let term = document.querySelector("#searchterm").value;

    term = term.trim();

    term = encodeURIComponent(term);

    if(term.length == 0)return;
    displayTerm = term;
    
    let apiURL = `https://restcountries.eu/rest/v2/name/${displayTerm}?fullText=true`;

    //10
    document.querySelector("#status").innerHTML = "<b>Searching for '" + displayTerm + `'</b>`;

    //11
    //console.log(apiURL);

    //12
    getData(apiURL);

}

function getData(url){
    //1 - create a new XHR object
    let xhr = new XMLHttpRequest();

    //2
    xhr.onload = dataLoaded;

    //3
    xhr.onerror = dataError;

    try {
        xhr.open("GET",url);
    } catch (error) {
        return;
    }
    xhr.send();
}

//callback functions

function dataLoaded(e){
    let xhr = e.target;

    let startDate;      //initialise date variables
    let endDate; 

    if(rangedSearch){       //set both values if range exists
        endDate = document.querySelector("#endDate").value;
        startDate = document.querySelector("#startDate").value
    }
    else{                   //set both dates as the same value otherwise
        startDate = document.querySelector("#Date").value;
        endDate = document.querySelector("#Date").value
    }
    
    let obj = JSON.parse(xhr.responseText); 
    //console.log(obj)    

    if(obj.length == 1){
        let results = obj[0];

        ParseCountry(results);

        //Get 2nd API Data
        let apiURL2 = `https://covidtrackerapi.bsg.ox.ac.uk/api/v2/stringency/actions/${obj[0].alpha3Code}/${endDate}`
        //console.log(`Getting covid policy data from: ${apiURL2}`)
        getData(apiURL2)
        return;
    }

    if(obj.policyActions){
        ParsePolicy(obj.policyActions);

        //look for covid data

        apiURL3 = `https://covidtrackerapi.bsg.ox.ac.uk/api/v2/stringency/date-range/${startDate}/${endDate}`;
        //console.log(`Getting covid data from: ${apiURL3} from ${startDate} to ${endDate}`);
        getData(apiURL3);
        return;
    }
    else if(obj.stringencyData){
        let noData = "<div id='policyData'><h2>Policy Data<br><br><em>No data available</em></h2>";
        document.querySelector("#content").innerHTML += noData;

        document.querySelector("#status").innerHTML = "Available data displayed";
        
        //look for covid data

        apiURL3 = `https://covidtrackerapi.bsg.ox.ac.uk/api/v2/stringency/date-range/${startDate}/${endDate}`;
        //console.log(`Getting covid data from: ${apiURL3} from ${startDate} to ${endDate}`);
        getData(apiURL3);
        return;
    }

    results = obj;
    ParseCovid(results);
    
    //17
    document.querySelector("#status").innerHTML = "<b>Success!</b><p><i>Here are results for '" + displayTerm + "' from "+ startDate +" to " + endDate + "</i><p>";
}

function dataError(e){
    //console.log("An error occured");
}

function SearchRange(){
    let target = document.querySelector("#datePicker");
    rangedSearch = true;

    let input = "Start date: <input type='date' id='startDate' value='2020-01-01' min='2020-01-01' max='2020-11-20'/>";
    input+="<br><br>"
    input+= "End date: <input type='date' id='endDate' value='2020-01-02' min='2020-01-01' max='2020-11-20'/>";

    target.innerHTML = input;
}

function SearchSpec(){
    let target = document.querySelector("#datePicker");
    rangedSearch = false;

    let input = "Date: <input type='date' id='Date' value='2020-01-01' min='2020-01-01' max='2020-11-20'/>";

    target.innerHTML = input;
}

function ParseCovid(obj){

    let bigString = "<div id='covidDataBox'><h2>Covid Data</h2><div id='covidData'>";

    for (let date in obj.data) {
        if (obj.data.hasOwnProperty(date)) {
            const element = obj.data[date][alpha3];
            let littleString = `<div id='${date}'><h2>${date}</h2><ul>`;
            
            if(element.confirmed){
                littleString += `<li>Confirmed Cases: ${element.confirmed.toLocaleString()}</li>`;
            }
            else{
                littleString += `<li>Confirmed Cases: 0 </li>`
            }

            if(element.deaths){
                littleString += `<li>Deaths: ${element.deaths.toLocaleString()}</li>`
            }
            else{
                littleString += `<li>Deaths: 0</li>`;
            }
            littleString += `<li>Policy stringency: ${element.stringency}</li>`;
            littleString += `<li>Actual stringency: ${element.stringency_actual}</li>`;
            littleString += "</ul></div>"

            bigString += littleString;
        }
    }

    document.querySelector("#content").innerHTML += bigString + "</div></div>";
}

function ParseCountry(results){

    if(results.status == "404"){        //checks if the country name returns a value
        document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + `' from ${startDate} to ${endDate}<b>`;
        document.querySelector("#content").innerHTML = "No Data!"
        return;
    }
    
    //Add Country data to its list
    let bigString = "<div id='countryData'><h2>Country Data</h2><ul>";
    bigString += `<li>Name: ${results.name}</li>`;
    bigString += `<li>Alpha 3 Code: ${results.alpha3Code}</li>`;
    bigString += `<li>Calling Code: ${results.callingCodes}</li>`
    bigString += `<li>Capital: ${results.capital}</li>`;
    bigString += `<li>Population: ${results.population.toLocaleString()}</li>`;
    bigString += `<li>Timezone(s): ${results.timezones}</li>`
    bigString += "</ul></div>"

    alpha3 = results.alpha3Code;

    document.querySelector("#content").innerHTML = bigString;
    document.querySelector("#Flag").innerHTML = `<img src='${results.flag}' alt='${results.name}'>`

    localStorage.setItem("srk7473Country", results.name)
    localStorage.setItem("srk7473Flag", `<img src='${results.flag}' alt='${results.name}'>`)
}

function ParsePolicy(results){
    //reset bigstring and add policydata to its list
    let bigString = "<h2>Policy Data</h2><div id='policyData'>";
    for(let i = 0; i< results.length-1;i++){
        bigString+="<div id='PolicyResultBox'>"
        bigString+=`<h3>${results[i].policy_type_display}</h3>`
        bigString+=`<p>Policy Status (integer): ${results[i].policyvalue}<br>`
        bigString+=`Policy stringency: ${results[i].policy_value_display_field}<br>`
        bigString+=`Notes: ${results[i].notes}</p></div>`
    }
     
    if(results.length == 1){
        bigString += results[0].policy_type_display;
    }
     
    bigString += "</div>"
    document.querySelector("#content").innerHTML += bigString;
}

