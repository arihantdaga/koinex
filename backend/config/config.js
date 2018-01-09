const config = {
    db:{
        type:"mongoDb",
        uri:"mongodb://localhost:27017/koinex",
        options : { keepAlive: 1, autoReconnect: true, poolSize:4}
    }
}

module.exports = config;