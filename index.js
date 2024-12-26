var express = require('express');
var app = express();
var mySqlDao = require('./mySqlDao')
var bodyParser = require('body-parser')

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}))

//Making our app listen on port 3004
//Listening for connections on a certain port
app.listen(3004, ()=>{
    console.log("Running on port 3004");
})

//Returning the content of the home page - what the user will initially see
app.get("/", (req, res)=> {
    res.render("home");
})

//GET Method handling getting all the students from mysql
app.get("/students", (req, res)=> {
    mySqlDao.getStudents()
    .then((data)=>{
        console.log("THEN index.js")
        //res.send(data);
        res.render("students", {"studentList": data});
    })
    .catch((error)=>{
        console.log("CATCH index.js")
        res.send(error);
    })
})

//Getting the grades of each student for this application
app.get("/grades", (req, res)=> {
    mySqlDao.studentGrades()
    .then((data)=>{
        console.log("THEN index.js")
        //res.send(data);
        res.render("grades", {"gradeList": data});
    })
    .catch((error)=>{
        console.log("CATCH index.js")
        res.send(error);
    })
})