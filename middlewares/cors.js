// module.exports = (req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', '*');
//     next();
//   };

  module.exports = (req, res, next) => {
    // 确保参数正确传递，req、res、next必须声明
    if (!res) throw new Error('res对象未正确传入'); 
    
    res.header('Access-Control-Allow-Origin', 'http://47.103.169.121:8083'); // 匹配前端域名
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    
    // 处理预检请求（OPTIONS）
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  };