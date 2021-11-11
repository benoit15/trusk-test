
const client = require('redis').createClient();
const { promisify } = require("util");

client.on('connect', () => {
    console.log('Redis client connected');
});

client.on("error", (error) => {
    console.error(error);
});

const getValue = promisify(client.get).bind(client);
const setValue = promisify(client.set).bind(client);
const removeKey = promisify(client.del).bind(client);
const clearAll = promisify(client.flushall).bind(client);

const getList = async (key) => {
    let keys = new Promise(resolve => {
        client.keys(key, (err, res) => {
            if (err) console.error(err);
            resolve(res)
        })
    })

    let obj = {}
    for(const reply of await keys) {
        obj[reply] = await getValue(reply)
    }
    return obj
};

module.exports = {
    getValue,
    setValue,
    removeKey,
    getList,
    clearAll,
};