const express = require('express');
const router = express.Router();


//导入模型
var userModel = require("../model/user");

//新增接口
router.post("/create", async (req, res) => {
  try {
    await userModel.create({ name:'李磊', age:20, sex:'男' });
    res.send({
      code: 200,
      msg: "success",
    });
  } catch (e) {
    res.send({
      code: 500,
      msg: e.message || "fail",
    });
  }
});



// 数据校验中间件
const validate = (req, res, next) => {
    // 校验数据
    if (false) {
        console.log('数据校验通过');
        next();
    } else {
        //报错
        next(new Error('用户名必填'))
    }
};

// 用户不存在检查中间件
const userMustNotExist = (req, res, next) => {
    if (true) {
        console.log('用户不存在，可以注册');
        next();
    } else {
        console.log('用户已存在，无法注册');
        res.status(409).send('用户已存在，无法注册');
    }
};

// 密码加密中间件
const encryptPassword = (req, res, next) => {
    console.log('密码已加密');
    next();
};

// 注册处理中间件
const register = (req, res, next) => {
    console.log('注册成功');
    res.send('注册成功');
};

// 注册路由
router.post('/register', validate, userMustNotExist, encryptPassword, register);

module.exports = router;
    


// const express = require('express')
// const router=express.Router()
// //用户登录
// router.post('/login', (req, res) =>{
//     res.send('登录成功 router')
// })

// //用户注册
// router.post('/register', (req, res) =>{
//     res.send('注册成功 router')
// })

// module.exports = router

