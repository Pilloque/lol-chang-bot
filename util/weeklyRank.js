const { db, querySync } = require("./sql.js");
const { riotapi } = require("../tokens/config.json");
const { client } = require("../lolchang.js");
const reader = require("./weekReader.js");
const requestSync = require("./requestSync.js");

module.exports = async function weekly() {
    if (reader.get("workingState") === 0 && Date.now() > reader.get("nextWeek")) {
        reader.set("workingState", 1);

        const startTime = Date.now();
        console.log("데이터 집계 시작");
        await insertWeeks();
        console.log(`데이터 삽입 완료 (${((Date.now() - startTime) / 1000).toFixed(2)}초)`);
        await printWeeks();
        console.log("데이터 출력 완료");

        reader.set("currentWeekID", reader.get("currentWeekID") + 1);
        reader.set("nextWeek", reader.get("nextWeek") + 604800000);
        reader.set("workingState", 0);
    }
    setTimeout(weekly, 10000);
};

function insertWeeks() {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM lolchang.accounts;`, async (error, accounts, fields) => {
            if (error) return console.log(error);

            const beginTime = reader.get("nextWeek") - 604800000; // 604800000 is a week

            for (const account of accounts) {
                let url = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-account/${account.lol_id}?api_key=${riotapi}`;
                const summoner = await requestSync(url);

                //Change nickname if nickname change
                if (account.nickname !== summoner.name) {
                    await querySync(`UPDATE lolchang.accounts SET nickname = '${summoner.name}' WHERE lol_id = '${account.lol_id}'`);
                }

                url = `https://kr.api.riotgames.com/lol/match/v4/matchlists/by-account/${account.lol_id}?beginTime=${beginTime}&api_key=${riotapi}`;
                const matchlists = await requestSync(url);

                if (!matchlists.totalGames) {
                    await querySync(`INSERT INTO lolchang.weeks VALUES (${reader.get("currentWeekID")}, '${account.lol_id}', 0, ${summoner.summonerLevel}, 0);`);
                    continue;
                }

                let playtime = 0;
                for (const match of matchlists.matches) {
                    playtime += getPlaytime(match.queue);
                }

                await querySync(`INSERT INTO lolchang.weeks VALUES (${reader.get("currentWeekID")}, '${account.lol_id}', ${playtime}, ${summoner.summonerLevel}, ${matchlists.totalGames});`);

                await sleep(3000);
            }

            resolve();
        });
    });
}

function printWeeks() {
    return new Promise((resolve, reject) => {
        const currentWeekID = reader.get("currentWeekID");
        const currentTime = reader.get("nextWeek");

        db.query(`SELECT * FROM lolchang.channels;`, async (error, results, fields) => {
            if (error) return console.log(error);

            for (const row of results) {
                if (!client.channels.has(row.channel_id)) {
                    db.query(`DELETE FROM lolchang.channels WHERE channel_id = ${row.channel_id}`, (error, results, fields) => {
                        if (error) return console.log(error);
                    });
                    continue;
                }

                db.query(`SELECT W.*, A.nickname FROM lolchang.weeks W JOIN lolchang.includes I ON W.week_id = ${currentWeekID} AND I.guild_id = ${row.guild_id} AND I.lol_id = W.lol_id JOIN lolchang.accounts A ON A.lol_id = I.lol_id;`, async (error, weeks, fields) => {
                    if (error) return console.log(error);

                    if (!weeks.length) {
                        return;
                    }

                    const rank = [];

                    for (const w of weeks) {
                        let playtime = w.playtime;

                        const subaccounts = await querySync(`SELECT W.* FROM lolchang.weeks W JOIN lolchang.subaccounts S ON W.week_id = ${currentWeekID} AND S.guild_id = ${row.guild_id} AND S.primary_id = '${w.lol_id}' AND W.lol_id = S.secondary_id;`);

                        if (!subaccounts.length) {
                            rank.push([w.nickname, playtime]);
                            continue;
                        }

                        let accountsNum = 0;
                        for (const sub of subaccounts) {
                            playtime += sub.playtime;
                            accountsNum++;
                        }
                        rank.push([`${w.nickname} (부캐 ${accountsNum}개)`, playtime]);
                    }

                    rank.sort((a, b) => b[1] - a[1]);
                    client.channels.get(row.channel_id).send(stringifyRank(rank, currentTime));
                });
            }
            resolve();
        });
    });
}

function stringifyRank(arr, time) {
    const date = new Date(time);
    let text = `\`\`\`ini\n[${date.getMonth() + 1}월 ${getJucha(date)}주차 롤창 랭킹]\`\`\`\`\`\``;
    let min;
    for (let i = 0; i < arr.length; ++i) {
        min = arr[i][1] / 60;
        text += `\n${i + 1}위 ${Number.isInteger(min) ? min : min.toFixed(1)}시간 -> ${arr[i][0]}`;
    }
    text += "```";

    return text;
}

function getJucha(date) {
    return Math.floor((date.getDate() - getMondayFirstDay(date.getDay()) + 5) / 7) + 1;
}

function getMondayFirstDay(day) {
    return (day + 6) % 7;
}

function getPlaytime(queueID) {
    switch (queueID) {
    case 420:
        return 28; // 소환사 협곡 솔로 랭크
    case 450:
        return 19; // 칼바람
    case 830:
    case 840:
        return 15; // 입문, 초급 AI
    case 850:
        return 22; // 중급 AI (이 값은 내 추측)
    default:
        return 27; // 소환사 협곡 및 기타
    }
}

function sleep(ms) {
    return new Promise(resolve => { setTimeout(resolve, ms); });
}