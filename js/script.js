var input = document.getElementById("name");
var name = "";
var btn = document.getElementById("btn");
var over = document.getElementById("start-over");
var toTop = document.getElementById("to-the-top");
var fin = document.getElementById("fin");
var cards = document.getElementById("countries");
var list = document.getElementById("list");
var info = [];
var displayed = [];
var visited = [];
var level = 0;
var pageHeight = 1000;
var page = document.getElementById("page");
loadDoc("https://restcountries.eu/rest/v2/all", setToArray);

// Asettaa painikkeen klikattavaksi, kun input-kentässä on väh. 2 merkkiä.
input.addEventListener("keyup", () => {
    name = input.value;
    if (name.length >= 2) {
        btn.removeAttribute("disabled");
    }
    else {
        btn.setAttribute("disabled", null);
    }
});

// Painiketta klikattaessa kirjoittaa käyttäjän nimen matkasuunnitelmaan ja arpoo kolme aloitusmaata.
btn.addEventListener("click", () => {
    var name = input.value;
    var itinerary = document.getElementById("itinerary");
    var htmlString = "";
    htmlString += "<p id='it-name'><i>" + name + "</i></p><h5 id='it-header'>Your itinerary</h5>"
    itinerary.insertAdjacentHTML("afterbegin", htmlString);

    document.getElementById("name").value = "";
    input.setAttribute("disabled", null);
    btn.setAttribute("disabled", null);
    over.removeAttribute("disabled");
    fin.removeAttribute("disabled");
    toTop.removeAttribute("disabled");
    drawThree();
});

over.addEventListener("click", startOver);

toTop.addEventListener("click", toTheTop);

fin.addEventListener("click", finish);

function select() {

    pageHeight += 500;
    var style = "min-height:" + pageHeight + "px;";
    page.setAttribute("style", style);
    this.setAttribute("class", "selected");
    this.addEventListener("click", unselect);

    disablePrev();

    var id = this.id.split("_")[1];

    // Katsotaan mitkä maat ovat sellaisia joissa ei ole käyty
    visited.push(id);
    level++;
    var validBorders = [];
    var borders = info[id].borders;

    for (i in borders) {
        for (j in info) {
            if (borders[i] == info[j].alpha3Code) {
                var borderId = j;
                break;
            }
        }
        if (!(_.contains(visited, borderId))) {
            validBorders.push(borderId);
        }
    }

    // Seuraavaa tasoa varten uusi div
    var t = newTier();
    var tier = t[1];
    var tierCards = t[0];

    // Ei mahdollisia siirtoja
    if (validBorders.length == 0) {
        endOfTiers(tier);
    }

    // On mahdollisia siirtoja
    else {
        tier.insertAdjacentHTML("afterbegin", "<div class='tier-header sticky-top'><h2>From " + info[id].name + " to...</h2></div>");

        // Luodaan rajanaapurille kortti, jos siellä ei ole vielä käyty
        for (i in borders) {
            for (j in info) {
                if (borders[i] == info[j].alpha3Code) {
                    var borderId = j;
                    break;
                }
            }
            if (!(_.contains(visited, borderId))) {
                createCard(borderId, tierCards);
            }
        }
    }
    list.insertAdjacentHTML("beforeend", "<li>" + info[id].alpha3Code + "</li>");
    window.scrollBy(0, 890);
}


// Lataa tiedot lähteestä ja suorittaa valitun funktion.
function loadDoc(url, cFunction) {
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        cFunction(this);
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

// Asettaa tiedot taulukkoon.
function setToArray(xhttp) {
    info = JSON.parse(xhttp.responseText);
}

// Arpoo kolme satunnaista maata.
function drawThree() {
    var t = newTier();
    var tierCards = t[0];
    var tier = t[1];
    var randomThree = [];
    tier.insertAdjacentHTML("afterbegin", "<div class='tier-header sticky-top'><h2>Choose your starting country:</h2></div>");

    for (var i = 0; i < 3; i++) {
        let index = Math.floor(Math.random() * 250);
        if (info[index].borders.length < 2 || _.contains(randomThree, index)) {
            i--;
        }
        else {
            randomThree.push(index);
        }
    }
    for (j in randomThree) {
        createCard(randomThree[j], tierCards);
    }

}

// Luo uuden maakortin.
function createCard(index, tier) {
    var borderNames = "";
    var borders = info[index].borders;
    for (i in borders) {
        borderNames += borders[i] + ", ";
    }
    borderNames = borderNames.substr(0, borderNames.length - 2);

    var htmlString = "";
    htmlString += "<div class='info-card' id='" + level + "_" + index + "'><div class='flag'>";
    htmlString += "<img src='" + info[index].flag + "' width='100%'></div><div class='info-text'>";
    htmlString += "<h4>" + info[index].name + "</h4><hr>";
    htmlString += "<p class='native'><i>" + info[index].nativeName + "</i></p>";
    htmlString += "<p><b>Capital: </b>" + info[index].capital + "</p>";
    htmlString += "<p><b>Currency: </b>" + info[index].currencies[0].name + "</p>";
    htmlString += "<p><b>Region: </b>" + info[index].subregion + "</p>";
    htmlString += "<p><b>Borders: </b>" + borderNames + "</p></div>";
    htmlString += "</div>";

    tier.insertAdjacentHTML("beforeend", htmlString);

    document.getElementById(level + "_" + index).addEventListener("click", select);
}

// Luo uuden tierin.
function newTier() {
    var tier = document.createElement("div");
    tier.setAttribute("class", "tier");
    tier.setAttribute("id", "tier" + level);

    var tierCards = document.createElement("div");
    tierCards.setAttribute("class", "tier-cards");
    tierCards.setAttribute("id", "tier-cards" + level);
    tier.appendChild(tierCards);
    cards.appendChild(tier);

    return [tierCards, tier];
}

// Poistaa edellisen tierin event listenerit.
function disablePrev() {
    var prev = document.getElementById("tier-cards" + level).children;
    var prevTier = Array.prototype.slice.call(prev, 0);
    for (i in prevTier) {
        prevTier[i].removeEventListener("click", select);
    }
}

function unselect() {
    // Jos kortti on aiemman kuin edellisen tason, ei tehdä mitään.
    if (level-1 == this.id.split("_")[0]) {
        pageHeight -= 500;
        var style = "min-height:" + pageHeight + "px;";
        page.setAttribute("style", style);

        this.setAttribute("class", "info-card");
        cards.removeChild(cards.lastChild);
        this.removeEventListener("click", unselect);

        level--;

        // Poistetaan edellisen tason event listenerit
        var prev = document.getElementById("tier-cards" + level).children;
        var prevTier = Array.prototype.slice.call(prev, 0);
        for (a in prevTier) {
            prevTier[a].addEventListener("click", select);
        }
        document.getElementById("list").removeChild(document.getElementById("list").lastChild);
        visited.pop();
    }
}

// Scrollaa sivun ylös
function toTheTop() {
    window.scrollTo(0, 0);
}

// Tyhjentää kaikki valinnat
function startOver() {
    while (cards.hasChildNodes()) {
        cards.removeChild(cards.lastChild);
    }
    while (list.hasChildNodes()) {
        list.removeChild(list.lastChild);
    }

    document.getElementById("it-header").remove();
    document.getElementById("it-name").remove();
    input.removeAttribute("disabled");
    btn.removeAttribute("disabled");
    over.setAttribute("disabled", null);
    fin.setAttribute("disabled", null);
    toTop.setAttribute("disabled", null);

    visited = [];

    pageHeight = 1000;
    var style = "min-height:" + pageHeight + "px;";
    page.setAttribute("style", style);

    toTheTop();
}

// Viiemeinen tier
function endOfTiers(tier) {
    tier.insertAdjacentHTML("afterbegin", "<div class='tier-header' id='tier-header" + level + "'><h2>No more moves possible.</h2></div>");
}

// Lopetus
function finish() {
    var htmlNames = "";
    var htmlCurrencies = "";
    var visitedNames = [];
    visitedCurrencies = [];
    for (i in visited) {
        for (j in info) {
            if (visited[i] == j) {
                console.log(info[j].name);
                visitedNames.push(info[j].name);
                htmlNames += "<li>" + info[j].name + "</li>";

                if (!(_.contains(visitedCurrencies, info[j].currencies[0].name))) {
                    visitedCurrencies.push(info[j].currencies[0].name);
                }
            }
        }
    }
    for (k in visitedCurrencies) {
        htmlCurrencies += "<li>" + visitedCurrencies[k] + "</li>";
    }

    document.getElementById("exampleModalLongTitle").innerHTML = "Let's go " + name + "!";
    document.getElementById("modal-list").innerHTML = htmlNames;
    document.getElementById("modal-curr").innerHTML = htmlCurrencies;
}