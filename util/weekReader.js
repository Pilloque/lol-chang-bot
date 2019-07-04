const fs = require("fs");

const data = fs.readFileSync("./week.json", "utf8");
let weekInfo = JSON.parse(data);

exports.get = function (key) {
    return weekInfo[key];
};

exports.set = function (key, value) {
    weekInfo[key] = value;
    fs.writeFileSync("./week.json", JSON.stringify(weekInfo), { encoding: 'utf8', flag: 'w' });
};