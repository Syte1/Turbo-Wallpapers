

ready(function() {

    console.log("Client script loaded.");

    function ajaxGET(url, callback) {

        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                //console.log('responseText:' + xhr.responseText);
                callback(this.responseText);

            } else {
                console.log(this.status);
            }
        }
        xhr.open("GET", url);
        xhr.send();
    }

    function ajaxPOST(url, callback, data) {

        let params = typeof data == 'string' ? data : Object.keys(data).map(
                function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
            ).join('&');
        console.log("params in ajaxPOST", params);

        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                //console.log('responseText:' + xhr.responseText);
                callback(this.responseText);

            } else {
                console.log(this.status);
            }
        }
        xhr.open("POST", url);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(params);
    }

    // POST TO THE SERVER
    document.querySelector("#submit").addEventListener("click", function(e) {
        e.preventDefault();
        let email = document.getElementById("email");
        let password = document.getElementById("password");
        let queryString = "email=" + email.value + "&password=" + password.value;
        //console.log("data that we will send", email.value, password.value);

        ajaxPOST("/login", function(data) {

            if(data) {
                let dataParsed = JSON.parse(data);
                console.log(dataParsed);
                if(dataParsed.status == "fail") {
                    document.getElementById("errorMessage").innerHTML = dataParsed.msg;
                } else {
                    window.location.replace("/profile");
                }
            }
            //document.getElementById("errorMsg").innerHTML = dataParsed.msg;

        }, queryString);
    });




//
//    // CLEAR THE DATE IN THE PARAGRAPH
//    document.querySelector("#clearDate").addEventListener("click", function(e) {
//        e.preventDefault();
//
//        document.getElementById("p1").innerHTML = "<b>Date goes here</b>";
//
//    });
//
//    // GET THE DATE FROM THE SERVER
//    document.querySelector("#getDate").addEventListener("click", function(e) {
//        e.preventDefault();
//        ajaxGET("/ajax-date", function(data) {
//            console.log(data);
//            // this call is JSON so we have to parse it:
//            let parsedData = JSON.parse(data);
//            document.getElementById("p1").innerHTML = parsedData.currentTime;
//        });
//    });
//
//    // GET A LIST FROM THE SERVER - AND ASK FOR IT AS HTML
//    document.querySelector("#getHTMLList").addEventListener("click", function(e) {
//        e.preventDefault();
//        ajaxGET("/ajax-GET-list?format=html-list", function(data) {
//            console.log("html list", data);
//            document.getElementById("content").innerHTML = data;
//        });
//    });
//
//    // GET A LIST FROM THE SERVER - AND ASK FOR IT AS JSON
//    document.querySelector("#getJSONList").addEventListener("click", function(e) {
//        e.preventDefault();
//        ajaxGET("/ajax-GET-list?format=json-list", function(data) {
//            console.log(data);
//            // this call is JSON so we have to parse it:
//            let parsedData = JSON.parse(data);
//
//            // we have to read through this JSON and pull out
//            // what items we need - and we need to know the format
//            // in order to do this!
//            let div = document.getElementById("content");
//            let htmlStr = "<ul>";
//            for(let i = 0; i < parsedData.length; i++) {
//                htmlStr += "<li>" + parsedData[i] + "</li>";
//            }
//            htmlStr += "</ul>";
//            div.innerHTML = htmlStr;
//
//        });
//    });
//
//
//    // GET A LIST OF COURSES FROM THE SERVER - AND ASK FOR IT AS JSON
//    document.querySelector("#getJSONCourses").addEventListener("click", function(e) {
//        e.preventDefault();
//        ajaxGET("/ajax-GET-list?format=getJSONCourses", function(data) {
//            console.log(data);
//            // this call is JSON so we have to parse it:
//            let parsedData = JSON.parse(data);
//
//            // we have to read through this JSON and pull out
//            // what items we need - and we need to know the format
//            // in order to do this!
//            let t2 = "<table>";
//            for(let i = 0; i < parsedData.length; i++) {
//                t2 += "<tr><td>" + parsedData[i]['name'] + "</td><td>"
//                  + parsedData[i].number + "</td><td>" + parsedData[i]['credits'] + "</td></tr>";
//            }
//            t2 += "</table>";
//            let div = document.getElementById("content");
//            div.innerHTML = t2;
//
//        });
//    });
//
//    // POST TO THE SERVER
//    document.querySelector("#submit").addEventListener("click", function(e) {
//        e.preventDefault();
//        let first = document.getElementById("firstName");
//        let last = document.getElementById("lastName");
//        let email = document.getElementById("email");
//        //console.log("data that we will send", first.value, last.value, email.value);
//
//        ajaxPOST("/post-form", function(data) {
//            console.log(data);
//
//        }, "q1=" + first.value + "&q2=" +last.value + "&q3=" + email.value);
//    });


});

function ready(callback) {
    if (document.readyState != "loading") {
        callback();
        console.log("ready state is 'complete'");
    } else {
        document.addEventListener("DOMContentLoaded", callback);
        console.log("Listener was invoked");
    }
}
