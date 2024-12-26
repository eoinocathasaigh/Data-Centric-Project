var express = require('express');
var app = express();
var mySqlDao = require('./mySqlDao')
var myMongoDao = require('./mongoDao')
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

//Navigating to the section to add a new student
app.get("/addStudent", (req,res)=>{
    res.render("addStudent")
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

//Getting all the lectureres for this program
app.get("/lecturers", (req,res)=>{
    myMongoDao.findAll()
    .then((data) => {
        res.render("lecturers", {"lectureList": data});
    })
    .catch((error) => {
        res.send(error)
    })
})

//Adding a new Student
//Handling sending data back to the database
app.post('/addStudent', (req, res) => {
    mySqlDao.addEmployee(req.body)
    .then(() => {
        res.redirect("/students")
    })
    .catch((error) =>{
        console.log(JSON.stringify(error))
        if(error.errorcode == 11000)
        {
            res.send("Error, Employee with ID: " + req.body._id + " already exists")
        }
        else{
            res.send(error)
        }
    })
})