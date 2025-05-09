const express = require('express');
const { access } = require('fs');
const path = require('path');
// console.log(express)








const app = express();
const port = 3001;

const userRouter=require('./router/user')
app.use('/user', userRouter)


//1.什么是错误处理中间件
//专门处理错误的中间件
//有4个参数:err、req、res、next
//这4个参数必写,即使不用也不能省略,因为源码中是通过参数个数是不是4,来判断这是什么中间件,是4的话就是错误,处理中间件
//(err,req,res,next)= >{}
//2.如何将错误传递给错误处理中间件
//在出错的地方,调用next(错误或错误信息)把错误传递给错误处理中间件
//next('route')会跳到下一个路由,不会把错误处理中间件
app.use((err, req, res, next)=> {
    res.status(401).send({
        msg: err.message,
        code: 1001})
    console.log(err.message)}
)

// 1. 在响应中设置 cookie
// app.get('/cookie', (req, res) => {
//     // maxAge 单位是 ms
//     res.cookie('username', 'Alex', {
//         maxAge: 100000000
//     });
//     res.cookie('gender', 'male', {
//         maxAge: 100000000
//     });
//     res.send('Hi');
// });


// 1. 处理请求体中 application/x-www-form-urlencoded 格式的数据
// 使用 express 内置的 urlencoded 中间件
// express.urlencoded()
//extended必须传,extended:false表示内部使用querystring模块,推荐
//extended:true表示内部使用qs模块
//qs模块可以解析更复杂的字符串,这里没必要使用
app.use(express.urlencoded({ extended: false }));

// 处理针对 /user 的 POST 请求
// app.post('/user', (req, res) => {
//     console.log(req.body);
//     res.send('Received POST data on /user');
// });
//2.处理请求体中application/json格式的数据
// express.json()
app.use(express.json())
app.post('/user', (req, res) => {
    console.log(req.body);
    res.send('Received POST data on /user');
});

// 正确使用 express.static 中间件，注意 __dirname 的双下划线
// http://localhost:3001/index.html
// app.use(express.static(path.join(__dirname, 'public')));
// http://localhost:3001/static/index.html
app.use('/static', express.static(path.join(__dirname, 'public')));

//1.处理请求体中application/x-www-form-urlencoded格式的数据
// username=alex&gender=male
// app.use((req, res, next)=>{
//     console.log(req.header('Content-Type'))
// })
// // 2.引入自定义的 urlencoded 中间件
// const urlencoded = require('./middleware/urlencoded');

// // 使用中间件
// app.use(urlencoded());

// app.post('/user', (req, res) => {
//     console.log(req.body)
// })

// 路由
// const userRouter=require('./router/user')
// // console.log('1111111',userRouter)
// app.use('/user', userRouter)


// 2.METHOD 和 all 中间件
//使用app.METHOD()或app.all()方法将中间件提供给Express调周用
//app.METHOD()具体指:app.get()、app.post()、app.put()、app.delete()等
//METHOD()或all()方法第一个参数一般都要写出来的,不会省省略
//METHOD()方法会匹配对应的HTTP方法,all()方法会匹配所有HTTP方法
//METHOD()或all()方法匹配路径的规则为:路径相等匹配
//可以给同一个路径注册多个中间件函数
//可以在一个METHOD()或all()方法中注册多个中间件函数
//可以通过next('route')跳到下一个路由
//next('route')只会在METHOD()或all()中起作用
// 第一个中间件
// app.get('/', (req, res, next) => {
//     console.log('中间件1');
//     // 使用 next('route') 跳过后续的中间件，直接进入下一个匹配的路由处理函数
//     next('route');(req, res, next) => {
//         console.log('中间件2');
//         next();
//     }
// });
// // 最终的路由处理函数
// app.get('/', (req, res) => {
//     res.send('Hello, World!');
// });








// // 设置视图引擎为 EJS
// app.set('view engine', 'ejs');
// // 设置视图文件的路径
// app.set('views', path.join(__dirname, 'views'));




// app.get('/user/:id', (req, res) => {
//     app.set('views', path.join(__dirname, 'views'));
//     // 设置默认的模板后缀名
//     app.set('view engine', 'html');

//     // 设置指定后缀名的文件使用什么模板引擎
//     app.engine('html', require('ejs').__express);
//     res.render('user', {
//         id: req.params.id
//     })
//     //  console.log(req.params.id)
// })

// app.get('/user/register', (req, res) => {
//     console.log(req.url)
//     console.log(req.path)
//     console.log(req.query)
//     res.send('Hello World! /')
// })
// app.get('/user', (req, res) => {
//      console.log("1111111111111111111")
// })
// app.get('/user/:id', (req, res) => {
//     res.render('user.ejs', {
//         id: req.params.id
//     })
//     //  console.log(req.params.id)
// })
// app.get('/user', (req, res) => {
//     console.log(req.url)
//     // console.log(req.path)
//     // console.log(req.query)
//     // console.log(req.method)
//     // console.log(req.headers)
//     // console.log(req.query)
//     // console.log(req.app===app,res.req===req)
//     // console.log(req.get('user-agent'))
//     // res.send('Hello World! /user')
//     // res.send('<h1>Hello World! /user</h1>')
//     // res.send({
//     //     id: 1,
//     //     name: '张三'
//     // })
//     // res.send([{
//     //     id: 1,
//     //     name: '张三'
//     // },{
//     //     id: 2,
//     //     name: '李四'
//     // }])
//     // res.json([{
//     //     id: 1,
//     //     name: '张三'
//     // },{
//     //     id: 2,
//     //     name: '李四'
//     // }])
//     // console.log(path.join(__dirname, 'public', 'index.html'))
//     // res.sendFile(path.join(__dirname, 'public', 'index.html'))
//     // res.sendStatus(404).send('Not Found')
//     // 有res.set('Content-Type', 'text/plain; charset=utf-8')是字符串(h1标签是白色)，没有是html(h1标签是红色)
//     // res.set('Content-Type', 'text/plain; charset=utf-8')
//     // res.set({'Content-Type':'text/plain; charset=utf-8',
//     //     'Access-Control-Allow-Origin':'*'}
//     // )
//     // res.header({'Content-Type':'text/plain; charset=utf-8',
//     //     'Access-Control-Allow-Origin':'*'}
//     // )
//     // res.send('<h1>Hello World! /user</h1>')
// })
// app.get('/user/:id', (req, res) => {
//     console.log(req.params)
//     res.send('Hello World! /user:id')
// })

// app.post('/login', (req, res) => {
//     res.send('登录成功')
// })

// app.get('/login', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'login.html'))
// })

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})