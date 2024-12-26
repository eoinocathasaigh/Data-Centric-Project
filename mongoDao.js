const { json } = require('express')

const MongoClient = require('mongodb').MongoClient

//Connecting to the mongodb database
MongoClient.connect('mongodb://127.0.0.1:27017')
.then((client) => {
    db = client.db('proj2024MongoDB')
    coll = db.collection('lecturers')
})
.catch((error) => {
    console.log(error.message)
})

//Fining all of the lecturers
var findAll = function() {
    return new Promise((resolve, reject) => {
        coll.find().sort({_id:1}).toArray()
        .then((documents) => {
            resolve(documents)
    })
    .catch((error) => {
        console.log("CATCH => " + JSON.stringify(error))
        reject(error)
    })
})}

var addEmployee = function(employee) {
    return new Promise((resolve, reject) => {
        coll.insertOne(employee)
        .then(() => {
            resolve()
        })
        .catch((error) => {
            console.log(JSON.stringify(error))
            reject(error)
        })
    })
}    

module.exports = {findAll, addEmployee}