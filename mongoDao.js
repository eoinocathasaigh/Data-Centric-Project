const { json } = require('express')

const MongoClient = require('mongodb').MongoClient

//Connecting to the mongodb database & selecting what specific collection we want to use
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
        //Finding all & sorting based on the id ascending
        coll.find().sort({_id:1}).toArray()
        .then((documents) => {
            resolve(documents)
        })
        .catch((error) => {
            console.log("CATCH => " + JSON.stringify(error))
            reject(error)
        })
})}

//Method for deleting the lecturer based on their unique id
const deleteLecturer = async (lecturerId) => {
    try {
        //Deleting the singular specified lecturer based on their id
        const result = await coll.deleteOne({ _id: lecturerId });
        return result;
    } catch (error) {
        throw new Error(`Error deleting lecturer: ${error.message}`);
    }
};

module.exports = {findAll, deleteLecturer}