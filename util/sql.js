const mysql = require("mysql")
const dblogin = require("../tokens/dblogin.json");

const db = mysql.createConnection({
	host: dblogin.host,
	user: dblogin.user,
	password: dblogin.password,
	database: dblogin.database,
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