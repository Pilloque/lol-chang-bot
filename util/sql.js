const mysql = require("mysql")
const dblogin = require("../tokens/dblogin.json");

const db = mysql.createConnection({
	host: dblogin.host,
	user: dblogin.user,
	password: dblogin.password,
	database: dblogin.database,
	supportBigNumbers: true,
	bigNumberStrings: true,
});

db.connect(err => {
	if (err) {
	  console.error('error connecting: ' + err.stack);
	  return;
	}

	console.log('connected as id ' + db.threadId);
});


exports.mysql = mysql;
exports.db = db;

exports.querySync = function (query) {
    return new Promise((resolve, reject) => {
        db.query(query, (error, results, fields) => {
            if (error) reject(error);

            resolve(results);
        });
    });
}