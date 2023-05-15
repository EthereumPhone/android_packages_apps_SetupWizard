var deviceWidth = 421; //881,421,412
var deviceHeight = 861; //881,861,846
var lineWidth;
var maxLogoAmount = 900;
var attempts = 100;
var logos = [];
var step = 20;
var xoff = 0;
var minSize = 20;
var maxSize = 200;

var colorpalletes = [

    ["#0081A7", "#00AFB9", "#F07167", "#FFFD98", "#BDE4A7"],
    ["#FF595E", "#FFCA3A", "#8AC926", "#1982C4", "#6A4C93"],
    ["#4D5057", "#4E6E5D", "#4DA167", "#3BC14A", "#CFCFCF"],
    ["#2C6E49", "#4C956C", "#823329", "#FFC9B9", "#D68C45"],
    ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"],
    ["#003049", "#D62828", "#F77F00", "#FCBF49", "#D0E37F"],
    ["#485696", "#E7E7E7", "#F9C784", "#FC7A1E", "#F24C00"],
    ["#F24C00", "#412234", "#6D466B", "#B49FCC", "#EAD7D7"],
    ["#2F323A", "#77567A", "#C47AC0", "#E39EC1", "#DEBAC0"],
    ["#ECA400", "#EAF8BF", "#006992", "#27476E", "#001D4A"],
    ["#231F20", "#BB4430", "#7EBDC2", "#F3DFA2", "#EFE6DD"],
    ["#FFC15E", "#F7B05B", "#F7934C", "#CC5803", "#1F1300"],
    ["#E2CFEA", "#A06CD5", "#6247AA", "#102B3F", "#062726"],
    ["#8CB369", "#F4E285", "#F4A259", "#5B8E7D", "#BC4B51"],
    ["#9CF6F6", "#F3C98B", "#DAA588", "#C46D5E", "#F56960"],
    ["#2A0800", "#775144", "#C09891", "#BEA8A7", "#F4DBD8"],
    ["#442F38", "#9A9B73", "#C6B38E", "#E7F9A9", "#3D0814"],
    ["#ab9f98", "#BE5A38", "#353238", "#92140C", "#BE7C4D"],
    ["#3c1642", "#086375", "#1dd3b0", "#affc41", "#b2ff9e"],
    ["#5f0f40", "#9a031e", "#fb8b24", "#e36414", "#0f4c5c"],
    ["#780000", "#F0A202", "#0C5278", "#003049", "#669bbc"],
    ["#3d5a80", "#98c1d9", "#EFD28D", "#ee6c4d", "#293241"],
    ["#011627", "#F4E409", "#2ec4b6", "#e71d36", "#ff9f1c"],
    ["#321325", "#5f0f40", "#9a031e", "#cb793a", "#fcdc4d"],
    ["#090809", "#f40000", "#f44e3f", "#f4796b", "#f4998d"],
    ["#4f000b", "#720026", "#ce4257", "#ff7f51", "#ff9b54"],
    ["#fe5826", "#4b9d97", "#0d7876", "#076764", "#d8b593"],

]
var randomPallet;
var tiles;
var rnddiv = [1, 1.5, 2, 4, 8, 16];

var normalStroke = true; //
var withOffset = false;
var offsetLevel = 0; //random(1,5)
var maxoffset = 10;
var withRotation = false;

var tmp; //tempory variable


function setup() {
    createCanvas(deviceWidth, deviceHeight);
    angleMode(DEGREES);
    //colorMode(HSB);
    var rnd = Math.floor(Math.random() * (rnddiv.length - 1));
    tiles = floor(floor(width / step) / rnddiv[rnd]);
    console.log("tiles length", [tiles, rnddiv[rnd]]);

    ///console.log("Random", parseInt(Math.random() * colorpalletes.length));
    randomPallet = colorpalletes[parseInt(Math.random() * colorpalletes.length)];
    //console.log("arr", randomPallet);
    var bgIndex = parseInt(Math.random() * (randomPallet.length));
    //console.log("bg", bgIndex)
    background(randomPallet[bgIndex]);
    //console.log("bgIndex", bgIndex);
    randomPallet.splice(bgIndex, 1);
    //console.log("colorpall", randomPallet);
    lineWidth = 2;
    //console.log("lineWidth", lineWidth);

    //Type
    //Right now on random -> Later depends on MAC addresses


    //normal Strokes or thin strokes
    tmp = Math.random();
    if (tmp >= 0.7) {
        normalStroke = false;
    }

    //with offset or not
    tmp = Math.random();
    if (tmp >= 0.5) {
        withOffset = true;
        //if yes what kind of offset level
        offsetLevel = (Math.floor(Math.random() * 5)) + 1;
    }

    tmp = Math.random();
    if (tmp >= 0.5) {
        withRotation = true;
    }

    console.log("[normalStroke,withOffset,offsetLevel,withRotation]", [normalStroke, withOffset, offsetLevel, withRotation]);

    //type = Math.floor(random(0, 3));


}

function draw() {

    for (var y = 0; y < height; y += step) {
        for (var x = 0; x < width; x += step) {
            //translate(-step, -step)
            createLogo(x, y)
            //fill(randomPallet[parseInt(Math.random() * randomPallet.length)])
            //rect(x, y, 20, 20)
        }
    }

    for (var y = 0; y < height; y += step) {
        for (var x = 0; x < width; x += step) {
            fillLogo(x, y)
            //fill(randomPallet[parseInt(Math.random() * randomPallet.length)])
            //rect(x, y, 20, 20)
        }
    }
    //grainy()
    //drawLine2(0, 0, 100)

    noLoop();
    console.log("Image done")
    console.log("<picture>" + document.getElementById("defaultCanvas0").toDataURL())
}

function fillLogo(_x, _y) {
    var newLogo;
    var safe = false;
    newLogo = {
        //random place
        x: _x,
        y: _y,
        size: minSize
    }
    if (!detectCollision(newLogo)) {
        safe = true;
    }

    //ist es nicht sicher lass es aus
    if (!safe) {
        return;
    }

    logos.push(newLogo);

    if (withRotation) {
        drawLine2(newLogo.x, newLogo.y, newLogo.size)
    } else {
        drawLine(newLogo.x, newLogo.y, newLogo.size)
    }

}

function createLogo(_x, _y) {
    var newLogo;
    var safe = false;

    //Die Position eines Squares wird gefunden
    for (var tries = 0; tries < attempts; tries++) {
        //neues logo erstellt
        newLogo = {
            //random place
            x: _x,
            y: _y,
            size: Math.floor(Math.random() * tiles) * step
        }

        //gibt es eine collision
        if (detectCollision(newLogo)) {
            //newLogo.size = step;
            continue;
        } else {
            safe = true;
            break;
        }
    }

    //ist es nicht sicher lass es aus
    if (!safe) {
        return;
    }

    //Die größe wird verkleinert wenn es nicht reinpasst
    if (detectCollision(newLogo)) {
        for (var squareSize = minSize; squareSize < maxSize; squareSize += step) {
            newLogo.size = squareSize;
            if (detectCollision(newLogo)) {
                newLogo.size -= step;
                break;
            }
        }
    }

    //newLogo.size = (Math.floor(Math.random() * tiles) * step);
    /*while (!detectCollision(newLogo)) {
        newLogo.size = (Math.floor(Math.random() * tiles) * step);
    }*/



    logos.push(newLogo);
    //console.log("new logo", newLogo);
    //drawLine(newLogo.x, newLogo.y, newLogo.size);
    //fill("#ff0400");
    //fill(randomPallet[parseInt(Math.random() * randomPallet.length)]);
    //stroke(0)
    //rect(newLogo.x, newLogo.y, newLogo.size, newLogo.size)
    //var r = Math.random();
    if (withRotation) {
        drawLine2(newLogo.x, newLogo.y, newLogo.size)
    } else {
        drawLine(newLogo.x, newLogo.y, newLogo.size)
    }
    //


}

function detectCollision(newLogo) {
    for (var i = 0; i < logos.length; i++) { //loopen durch jeden kreis
        var other = logos[i];
        //console.log("other:", logos)
        if (newLogo.x < other.x + other.size &&
            newLogo.x + newLogo.size > other.x &&
            newLogo.y < other.y + other.size &&
            newLogo.size + newLogo.y > other.y) {

            //console.log("colls")
            return true;
        }
    }

    if (newLogo.x + (newLogo.size) > width ||
        newLogo.x < 0) {
        return true;
    }

    if (newLogo.y + (newLogo.size) > height ||
        newLogo.y < 0) {
        return true;
    }
    //console.log("no coll")
    return false;
}



function giveOffset(off) {
    var val;
    if (withOffset) {
        switch (offsetLevel) {
            case 5:
                val = Math.floor(random(-1, 1) * off)
                break;
            case 4:
                val = Math.floor(random(-1, 1) * (off * 0.1))
                break;
            case 3:
                val = Math.floor(random(-1, 1) * (off * 0.07))
                break;
            case 2:
                val = Math.floor(random(-1, 1) * (off * 0.05))
                break;
            case 1:
                val = Math.floor(random(-1, 1) * (off * 0.01))
                break;
            default:
                val = 0;
            //
            //return Math.floor(random(-1, 1) * (off * 0.07))
            //return Math.floor(random(-1, 1) * (off * 0.05))
            //return Math.floor(random(-1, 1) * (off * 0.1))

        }
    } else {
        return 0
    }

    return val
}


function drawLine(x, y, size) {
    //strokeCap(ROUND);
    var normal = noise(xoff) >= 0.5; //Math.random() >= 0.5;
    //var newLines;
    var offset;
    if (normal) {
        if (normalStroke) {
            strokeWeight(size * 0.1); //
            //console.log("strokeweight", size * 0.1)  
        } else {
            strokeWeight(lineWidth); //size * 0.1
        }

        stroke(randomPallet[parseInt(Math.random() * randomPallet.length)]);
        //rotate(45)
        //translate(-20, -20)
        //offset = Math.floor(random(-1, 1) * maxoffset)
        //console.log(offset);//parseInt(Math.random() * maxoffset);
        /*if(Math.random()>=0.5){
            offset = offset *-1)
        }*/
        line(x + (size * 0.1), y + (size * 0.1) + giveOffset(size), x + size - (size * 0.1), y + (size * 0.1) + giveOffset(size));
        //(Math.random() * 360, Math.random() * 100, Math.random() * 100);
        line(x + (size * 0.2), y + (size * 0.5) + giveOffset(size), x + (size * 0.8), y + (size * 0.5) + giveOffset(size));
        //stroke(Math.random() * 360, Math.random() * 100, Math.random() * 100);
        line(x + (size * 0.1), y + size - (size * 0.1) + giveOffset(size), x + size - (size * 0.1), y + size - (size * 0.1) + giveOffset(size));

        newLines = [{
            x: [x, y],
            y: [size, y]
        },
        {
            x: [x + size * 0.2, y + size * 0.4],
            y: [size * 0.8, y + size * 0.4]
        },
        {
            x: [x, y + size * 0.8],
            y: [size, y + size * 0.8]
        }
        ]

        //console.log("newLines", newLines)


    } else {
        if (normalStroke) {
            strokeWeight(size * 0.1); //
            //console.log("strokeweight", size * 0.1)  
        } else {
            strokeWeight(lineWidth); //size * 0.1
        }
        stroke(randomPallet[parseInt(Math.random() * randomPallet.length)]);
        //console.log("color", r)
        //translate(-20, -20)
        line(x + (size * 0.1) + giveOffset(size), y + (size * 0.1), x + (size * 0.1) + giveOffset(size), y + size - (size * 0.1));
        //stroke(Math.random() * 360, Math.random() * 100, Math.random() * 100);
        line(x + (size * 0.5) + giveOffset(size), y + (size * 0.2), x + (size * 0.5) + giveOffset(size), y + (size * 0.8));
        //stroke(Math.random() * 360, Math.random() * 100, Math.random() * 100);
        line(x + size - (size * 0.1) + giveOffset(size), y + (size * 0.1), x + size - (size * 0.1) + giveOffset(size), y + size - (size * 0.1));

        newLines = [{
            x: [x, y],
            y: [x, y + size]
        },
        {
            x: [x + size * 0.5, y + size * 0.2],
            y: [x + size * 0.5, y + size * 0.8]
        },
        {
            x: [x + size, y],
            y: [x + size, y + size]
        }
        ]

        //console.log("newLines", newLines)

    }
    xoff += 0.2;
}


function drawLine2(x, y, size) {
    //strokeCap(ROUND);
    var normal = noise(xoff) >= 0.5; //Math.random() >= 0.5;
    //var newLines;
    var offset;
    if (normal) {
        if (normalStroke) {
            strokeWeight(size * 0.1); //
            //console.log("strokeweight", size * 0.1)  
        } else {
            strokeWeight(lineWidth); //size * 0.1
        }
        stroke(randomPallet[parseInt(Math.random() * randomPallet.length)]);
        //rotate(45)
        //translate(-20, -20)
        //offset = Math.floor(random(-1, 1) * maxoffset)
        //console.log(offset);//parseInt(Math.random() * maxoffset);
        /*if(Math.random()>=0.5){
            offset = offset *-1)
        }*/
        //rect(x, y, size)
        line(x + (size * 0.1), y + (size / 2), x + (size / 2), y + (size * 0.1) + giveOffset(size));
        //(Math.random() * 360, Math.random() * 100, Math.random() * 100);
        line(x + (size * 0.40), y + (size * 0.60) + giveOffset(size), x + (size * 0.60), y + (size * 0.40) + giveOffset(size));
        //stroke(Math.random() * 360, Math.random() * 100, Math.random() * 100);
        line(x + (size / 2), y + size - (size * 0.1) + giveOffset(size), x + size - (size * 0.1), y + (size / 2) + giveOffset(size));

        newLines = [{
            x: [x, y],
            y: [size, y]
        },
        {
            x: [x + size * 0.2, y + size * 0.4],
            y: [size * 0.8, y + size * 0.4]
        },
        {
            x: [x, y + size * 0.8],
            y: [size, y + size * 0.8]
        }
        ]

        //console.log("newLines", newLines)


    } else {
        if (normalStroke) {
            strokeWeight(size * 0.1); //
            //console.log("strokeweight", size * 0.1)  
        } else {
            strokeWeight(lineWidth); //size * 0.1
        }
        stroke(randomPallet[parseInt(Math.random() * randomPallet.length)]);
        //console.log("color", r)
        //translate(-20, -20)
        //rect(x, y, size)
        line(x + (size * 0.1) + giveOffset(size), y + (size * 0.5), x + (size * 0.5) + giveOffset(size), y + size - (size * 0.1));
        //stroke(Math.random() * 360, Math.random() * 100, Math.random() * 100);
        line(x + (size * 0.4) + giveOffset(size), y + (size * 0.4), x + (size * 0.6) + giveOffset(size), y + (size * 0.6));
        //stroke(Math.random() * 360, Math.random() * 100, Math.random() * 100);
        line(x + (size / 2) + giveOffset(size), y + (size * 0.1), x + size - (size * 0.1) + giveOffset(size), y + (size / 2));

        newLines = [{
            x: [x, y],
            y: [x, y + size]
        },
        {
            x: [x + size * 0.5, y + size * 0.2],
            y: [x + size * 0.5, y + size * 0.8]
        },
        {
            x: [x + size, y],
            y: [x + size, y + size]
        }
        ]

        //console.log("newLines", newLines)

    }
    xoff += 0.2;
}