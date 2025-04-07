const querystring = require('node:querystring');

module.exports = () => {
    return (req, res, next) => {
        // 检查请求头的 Content-Type 是否为 application/json
        if (req.headers['content-type']!== 'application/json') {
            return next();
        }
        const results = [];
        // 监听 data 事件，收集请求体数据块
        req.on('data', (chunk) => {
            results.push(chunk);
        });
        console.log(results);
        // 监听 end 事件，当数据接收完成时进行处理
        req.on('end', () => {
            const data = Buffer.concat(results).toString();
            // 使用 JSON 模块解析数据并挂载到 req.body 上
            req.body = JSON.parse(data);
            next();
        });
        // 检查请求头的 Content-Type 是否为 application/x-www-form-urlencoded
        // if (req.headers['content-type']!== 'application/x-www-form-urlencoded') {
        //     return next();
        // }
        // const results = [];
        // // 监听 data 事件，收集请求体数据块
        // req.on('data', (chunk) => {
        //     results.push(chunk);
        // });
        // console.log(results);
        // // 监听 end 事件，当数据接收完成时进行处理
        // req.on('end', () => {
        //     const data = Buffer.concat(results).toString();
        //     // 使用 querystring 模块解析数据并挂载到 req.body 上
        //     req.body = querystring.parse(data);
        //     next();
        // });
    };
};    