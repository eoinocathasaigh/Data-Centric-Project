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

//Deleting a student
var deleteStudent = function(sid){
    return new Promise((resolve, reject)=>{
        var newQuery = {
            sql: "DELETE FROM student_table where student_id = ?",
            values: [sid]
        }
        pool.query(newQuery)
        .then(()=>{
            resolve()
        })
        .catch((error)=>{
            reject(error)
        })
    })
}

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
module.exports = { getStudents, deleteStudent, studentGrades }