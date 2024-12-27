var express = require('express');
var app = express();
var mySqlDao = require('./mySqlDao')
var myMongoDao = require('./mongoDao')
var bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator');

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
app.get("/student/add", (req,res)=>{
    res.render("addStudent", {"errors": undefined})
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
app.post("/student/add",
    [
        check("sid").isLength({ min: 4, max: 4 }).withMessage("Student ID must be exactly 4 characters"),
        check("name").isLength({ min: 2 }).withMessage("Student Name should be at least 2 characters"),
        check("age").isFloat({ min: 18 }).withMessage("Student Age should be at least 18"),
    ],
    (req, res) => {
        const validationErrors = validationResult(req);

        // Extract validation errors if any
        const errors = validationErrors.array();

        if (errors.length > 0) {
            // Render form with errors
            res.render("addStudent", { errors });
            console.log("Validation Errors:", errors);
        } else {
            const { sid, name, age } = req.body;
            const newStudent = { sid, name, age };

            mySqlDao.addStudent(newStudent)
            .then(() => {
                res.redirect("/students");
            })
            .catch((error) => {
                console.log("Database Error:", error);

                if (error.message.includes("Duplicate Student ID")) {
                    // Add custom error for duplicate Student ID
                    errors.push({ msg: "Student ID already exists" });
                } else {
                    errors.push({ msg: "An unexpected error occurred" });
                }

                // Render form with errors
                res.render("addStudent", { errors });
            });
        }
    }
);