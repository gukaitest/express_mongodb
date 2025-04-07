const db = require("./db");

//定义结构
let userSchema = db.Schema(
  {
    name: {
      type:String,
      required:true
    },
    age: Number,
    sex: {
      type:String,
      default:'未知'
    },
  },
  { versionKey: false }//隐藏_v字段
);

//创建模型
let userModel = db.model("user", userSchema, "user");

module.exports = userModel;
