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

//Editing a student based on their id
app.get('/students/edit/:id', (req, res, next) => {
    const studentId = req.params.id;
    mySqlDao.getStudentById(studentId)
    .then((student) => {
        if (student) {
            res.render("editStudent", { student: student , errors: undefined});
        } else {
            res.status(404).send("Student not found");
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send("Error retrieving student details");
    });
});

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

//Post method for updating the students details
app.post('/students/edit/:id',
    [
        check("name").isLength({ min: 2 }).withMessage("Student Name should be at least 2 characters"),
        check("age").isFloat({ min: 18 }).withMessage("Student Age should be at least 18"),
    ],
    (req, res) => {
        const studentId = req.params.id;
        const { name, age } = req.body;
        const updatedData = { name, age };

        // Collect validation errors
        const validationErrors = validationResult(req);
        const errors = validationErrors.array();

        if (errors.length > 0) {
            // Render the form with errors and preserve the input data
            res.render("editStudent", { student: { sid: studentId, name, age }, errors });
            console.log("Validation Errors:", errors);
        } else {
            // Call the DAO to edit the student
            mySqlDao.editStudent(studentId, updatedData)
            .then(() => {
                res.redirect('/students');
            })
            .catch((err) => {
                console.error("Error updating student:", err);
                res.status(500).send("Error updating student details");
            });
        }
    }
);

//Deleting the lecturer based on their id passed
//If the lecturer has an associated module then an appropriate message will be displayed
app.get('/lecturers/delete/:lid', (req, res) => {
    const lecturerId = req.params.lid; // Get the lecturer ID from the URL parameter

    // Check if the lecturer has any associated modules
    mySqlDao.getModuleLecturer(lecturerId)
    .then((modules) => {
        if (modules.length > 0) {
            // Lecturer has associated modules, redirect to the Delete page
            res.render("deleteLecturer", { lecturerId: lecturerId, message: "This lecturer has associated modules and cannot be deleted." });
        } else {
            // No associated modules, proceed with deletion logic
            myMongoDao.deleteLecturer(lecturerId)
            .then(() => {
                res.redirect('/lecturers'); // Redirect to the lecturers page if deletion is successful
            })
            .catch((error) => {
                console.error("Error deleting lecturer:", error);
                res.status(500).send("Error deleting lecturer");
            });
        }
    })
    .catch((error) => {
        console.error("Error fetching modules for lecturer:", error);
        res.status(500).send("Error fetching lecturer data");
    });
});