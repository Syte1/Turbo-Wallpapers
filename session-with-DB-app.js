const {
    table
} = require("console");
const express = require("express");
const session = require("express-session");
const app = express();
const fs = require("fs");
const {
    connect
} = require("http2");
const {
    JSDOM
} = require('jsdom');
const {
    fileURLToPath
} = require("url");

// static path mappings
app.use("/js", express.static("public/js"));
app.use("/css", express.static("public/css"));
app.use("/img", express.static("public/imgs"));
app.use("/fonts", express.static("public/fonts"));
app.use("/html", express.static("public/html"));
app.use("/media", express.static("public/media"));


app.use(session({
    secret: "extra text that no one will guess",
    name: "wazaSessionID",
    resave: false,
    saveUninitialized: true
}));



app.get("/", function (req, res) {

    if (req.session.loggedIn) {
        res.redirect("/profile");
    } else {

        let doc = fs.readFileSync("./app/html/index.html", "utf8");

        res.set("Server", "Wazubi Engine");
        res.set("X-Powered-By", "Wazubi");
        res.send(doc);

    }

});


app.get("/profile", async function (req, res) {

    // check for a session first!
    if (req.session.loggedIn) {
        const mysql = require("mysql2/promise");
        const connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "champinformation"
        });

        let profile = fs.readFileSync("./app/html/profile.html", "utf8");
        let profileDOM = new JSDOM(profile);
        // 
        // great time to get the user's data and put it into the page!

        results = await connection.query("SELECT * FROM champ");
        results = results[0];
        var table = profileDOM.window.document.createElement("table");
        table.innerHTML +=
            "<tr><th>" +
            "Champ Name" + "<th><th>" +
            "Type" + "<th><th>" +
            "Tankiness" + "<th><th>" +
            "Powerspike" + "<th><th>" +
            "Skill Required" + "<th><tr>"
        for (let i = 0; i < results.length; i++) {
            table.innerHTML +=
                "<tr><td>" + results[i]["championname"] +
                "<td><td>" + results[i]["type"] +
                "<td><td>" + results[i]["tankiness"] +
                "<td><td>" + results[i]["powerspike"] +
                "<td><td>" + results[i]["skillrequired"] +
                "<td><tr>"
        }
        var table1 = profileDOM.window.document.createElement("table")
        // for (let i = 0; i < results.length; i++) {
        table1.innerHTML +=
            "<tr><th>" +
            "Name" + "<th><th>" +
            "email" + "<th><th>" +
            "password" + "<th><th>" +
            "lastname" + "<th><th>" +
            "favoritecolor" + "<th><th>" +
            "favoritesong" + "<th><tr>"
        // }

        table1.innerHTML += "<tr><td>" +
            req.session.name + "<td><td>" +
            req.session.email + "<td><td>" +
            req.session.password + "<td><td>" +
            req.session.lastname + "<td><td>" +
            req.session.favoritecolor + "<td><td>" +
            req.session.favoritesong + "<td><tr>"
        // profileDOM.window.document.body.appendChild(usertable)


        // console.log(req.session.usersProfile)
        profileDOM.window.document.getElementById("table-here").appendChild(table);
        profileDOM.window.document.getElementById("usertable-here").appendChild(table1);
        // console.log(req.session.name)
        profileDOM.window.document.getElementsByTagName("title")[0].innerHTML = req.session.name + "'s Profile";
        profileDOM.window.document.getElementById("name").innerHTML = "Welcome Back, " + req.session.name;

        res.set("Server", "Wazubi Engine");
        res.set("X-Powered-By", "Wazubi");
        res.send(profileDOM.serialize());

    } else {
        // not logged in - no session and no access, redirect to home!
        res.redirect("/");
    }

});

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


// Notice that this is a "POST"
app.post("/login", function (req, res) {
    res.setHeader("Content-Type", "application/json");


    console.log("What was sent", req.body.email, req.body.password);


    let results = authenticate(req.body.email, req.body.password,
        function (userRecord) {
            //console.log(rows);
            if (userRecord == null) {
                // server couldn't find that, so use AJAX response and inform
                // the user. when we get success, we will do a complete page
                // change. Ask why we would do this in lecture/lab :)
                res.send({
                    status: "fail",
                    msg: "User account not found."
                })
            } else {
                // authenticate the user, create a session
                req.session.usersProfile = userRecord
                req.session.loggedIn = true;
                req.session.ID = userRecord.ID;
                req.session.name = userRecord.name;
                req.session.email = userRecord.email;
                req.session.password = userRecord.password;
                req.session.lastname = userRecord.lastname;
                req.session.favoritecolor = userRecord.favoritecolor;
                req.session.favoritesong = userRecord.favoritesong;
                req.session.save(function (err) {
                    // session saved, for analytics, we could record this in a DB 
                });
                // all we are doing as a server is telling the client that they
                // are logged in, it is up to them to switch to the profile page
                res.send({
                    status: "success",
                    msg: "Logged in."
                });
            }
        });

});

app.get("/logout", function (req, res) {

    if (req.session) {
        req.session.destroy(function (error) {
            if (error) {
                res.status(400).send("Unable to log out")
            } else {
                // session deleted, redirect to home
                res.redirect("/");
            }
        });
    }
});

function authenticate(email, pwd, callback) {

    const mysql = require("mysql2");
    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "champinformation"
    });
    connection.connect();
    connection.query(
        "SELECT * FROM user WHERE email = ? AND password = ?", [email, pwd],
        function (error, results, fields) {
            // results is an array of records, in JSON format
            // fields contains extra meta data about results
            console.log("Results from DB", results, "and the # of records returned", results.length, );
            // printer(results);
            if (error) {
                // in production, you'd really want to send an email to admin but for now, just console
                console.log(error);
            }
            if (results.length > 0) {
                // email and password found
                return callback(results[0]);
            } else {
                // user not found
                return callback(null);
            }

        }
    );

}

/*
 * Function that connects to the DBMS and checks if the DB exists, if not
 * creates it, then populates it with a couple of records. This would be
 * removed before deploying the app but is great for
 * development/testing purposes.
 */
async function init() {

    // we'll go over promises in COMP 2537, for now know that it allows us
    // to execute some code in a synchronous manner
    const mysql = require("mysql2/promise");
    const connection = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        multipleStatements: true
    });
    const createDBAndTables =
        `CREATE DATABASE IF NOT EXISTS champinformation;
        use champinformation;
        CREATE TABLE IF NOT EXISTS user (
        ID int NOT NULL AUTO_INCREMENT,
        name varchar(30),
        email varchar(30),
        password varchar(30),
        lastname varchar(30),
        favoritecolor varchar(30),
        favoritesong varchar(30),
        PRIMARY KEY (ID));
        
        CREATE TABLE IF NOT EXISTS champ (
        ID int NOT NULL AUTO_INCREMENT,
        championname varchar(30),
        type varchar(30),
        tankiness varchar(30),
        powerspike varchar(30),
        skillrequired varchar(30),
        PRIMARY KEY (ID));`;
    await connection.query(createDBAndTables);

    // await allows for us to wait for this line to execute ... synchronously
    // also ... destructuring. There's that term again!
    const [rows, fields] = await connection.query("SELECT * FROM user");
    // no records? Let's add a couple - for testing purposes
    if (rows.length == 0) {
        // no records, so let's add a couple
        let userRecords = "insert into user (name, email, password, lastname, favoritecolor, favoritesong) values ?";
        let recordValues = [
            ["Belal", "belalk@live.ca", "test", "Kourkmas", "Blue", "Deja Vu"],
            ["Ryze", "Ryze@gmail.com", "test", "Uzumaki", "Blue", "I'm blue"]
        ];
        await connection.query(userRecords, [recordValues]);
    }
    await connection.query(createDBAndTables);

    // await allows for us to wait for this line to execute ... synchronously
    // also ... destructuring. There's that term again!
    const [rows1, fields1] = await connection.query("SELECT * FROM champ");
    // no records? Let's add a couple - for testing purposes
    if (rows1.length == 0) {
        // no records, so let's add a couple
        let champRecords = "insert into champ (championname, type, tankiness, powerspike, skillrequired) values ?";
        let champValues = [
            ["Ryze", "Battle mage", "Squishy", "Late game", "Hard"],
            ["Garen", "Bruiser", "Tanky", "Early/mid-game", "Easy"],
            ["Teemo", "Bruiser", "Squishy", "Early/mid-game", "Easy"],
            ["Caitlyn", "Marksman", "Squishy", "Mid/late-game", "Medium"],
            ["Malphite", "Tank", "Tanky", "Mid-game", "Easy"],
            ["Sett", "Bruiser", "Tanky", "All-game", "Medium"],
            ["Gragas", "Bruiser", "Tanky", "Mid-game", "Medium"],
            ["Shen", "Tank", "Tanky", "Mid/late-game", "Medium"],
            ["Twitch", "Marksman", "Squishy", "Late game", "Hard"],
            ["Katarina", "Assassin", "Moderate", "Early/mid-game", "Hard"]
        ];
        await connection.query(champRecords, [champValues]);
    }
        console.log("Listening on port " + port + "!");
}

// RUN SERVER
let port = 8000;
app.listen(port, init);