//This DAO will handle our projects interaction with any and all sql content
var pmysql = require("promise-mysql");
var pool;

//Creating a pool of connections for this program

pmysql.createPool({
    connectionLimit : 1,
    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'proj2024Mysql'
    })
    //p passes back the connection to the database
    .then((p) => {
        pool = p
    })
    .catch((e) => {
        console.log("pool error:" + error)
    })

//Getting & Displaying all the students
var getStudents = function(){
    return new Promise((resolve, reject)=>{
        pool.query('SELECT * FROM student')
        .then((data) => {
            console.log("Students Received")
            resolve(data);
        })
        .catch((error) => {
            console.log("CATCH mySql.Dao.js")
            reject(error)
        })
   })
}

//Adding the student to the database
var addStudent = function (newStudent) {
    return new Promise((resolve, reject) => {
        pool.query(
            "INSERT INTO student (sid, name, age) VALUES (?, ?, ?)",
            [newStudent.sid, newStudent.name, newStudent.age]
        )
        .then(() => {
            console.log("Student added successfully");
            resolve();
        })
        .catch((error) => {
            console.error("Database Insert Error:", error);

            if (error.code === "ER_DUP_ENTRY") {
                reject(new Error("Duplicate Student ID"));
            } else {
                reject(error);
            }
        });
    });
};

//Getting the grades from each student
var studentGrades = function(){
    return new Promise((resolve, reject)=>{
        //Specific query to join the different tables together to get what we want to see in the grades page
        pool.query('SELECT s.name AS student_name, m.name AS student_module, g.grade AS student_grade FROM student s LEFT JOIN grade g ON s.sid = g.sid LEFT JOIN module m ON m.mid = g.mid ORDER BY s.name;')
        .then((data) => {
            console.log("Grades Received!")
            resolve(data);
        })
        .catch((error) => {
            console.log("CATCH mySql.Dao.js")
            reject(error)
        })
   })
}

//Method for selecting a specific student based on their id
var getStudentById = function(studentId) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM student WHERE sid = ?', [studentId])
        .then((data) => {
            resolve(data[0]); // Return the first result
        })
        .catch((error) => {
            reject(error);
        });
    });
};

//Actually editing the student
var editStudent = function(studentId, updatedData) {
    return new Promise((resolve, reject) => {
        pool.query(
            'UPDATE student SET name = ?, age = ? WHERE sid = ?', 
            [updatedData.name, updatedData.age, studentId]
        )
        .then(() => {
            console.log("Update successful for student:", studentId);
            resolve();
        })
        .catch((error) => {
            console.error("Database update error:", error); 
            reject(error);
        });
    });
};

//Getting all the modules
var getAllModules = function() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM module')
        .then((data) => {
            console.log("D="+ JSON.stringify(data))
            resolve(data)
        })
        .catch((error) => {
            console.log("E="+ JSON.stringify(error))
            reject(error)
        })
    })
}

//Getting the modules based on the lecturer ID - Used for deleting a module
//If we get a match then we return all the associated modules & prevent deletion
var getModuleLecturer = function(lecturerId) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM module WHERE lecturer = ?', [lecturerId])
        .then((data) => {
               resolve(data);
        })
        .catch((error) => {
            console.error("Error fetching modules for lecturer:", error);
            reject(error);
        });
    });
};

//Exporting all our methods so we can use them
module.exports = { getStudents, studentGrades, addStudent, getStudentById, editStudent, getAllModules, getModuleLecturer }