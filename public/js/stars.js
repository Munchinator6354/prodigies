$('.stars').each(function () {
    var starElement = $(this);
    var starImg = "<img src = '../images/stars.png'>"
    if (this.innerHTML === "5") {
        starElement.html(starImg + starImg + starImg + starImg + starImg);
    }
    else if (this.innerHTML === "4") {
        starElement.html(starImg + starImg + starImg + starImg);
    }
    else if (this.innerHTML === "3") {
        starElement.html(starImg + starImg + starImg);
    }
    else if (this.innerHTML === "2") {
        starElement.html(starImg + starImg);
    }
    else if (this.innerHTML === "1") {
        starElement.html(starImg);
    }
});
