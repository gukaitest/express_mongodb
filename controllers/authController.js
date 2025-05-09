// 模拟用户登录
exports.login = async (req, res) => {
    try {
      // 固定返回的模拟数据（实际项目需替换为真实逻辑）
      const responseData = {
        data: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjpbeyJ1c2VyTmFtZSI6IlNveWJlYW4ifV0sImlhdCI6MTY5ODQ4NDg2MywiZXhwIjoxNzMwMDQ0Nzk5LCJhdWQiOiJzb3liZWFuLWFkbWluIiwiaXNzIjoiU295YmVhbiIsInN1YiI6IlNveWJlYW4ifQ._w5wmPm6HVJc5fzkSrd_j-92d5PBRzWUfnrTF1bAmfk",
          refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjpbeyJ1c2VyTmFtZSI6IlNveWJlYW4ifV0sImlhdCI6MTY5ODQ4NDg4MSwiZXhwIjoxNzYxNTgwNzk5LCJhdWQiOiJzb3liZWFuLWFkbWluIiwiaXNzIjoiU295YmVhbiIsInN1YiI6IlNveWJlYW4ifQ.7dmgo1syEwEV4vaBf9k2oaxU6IZVgD2Ls7JK1p27STE"
        },
        code: "0000",
        msg: "请求成功"
      };
      res.status(201).json(responseData);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  // 获取用户信息
  exports.getUserInfo = async (req, res) => {
    try {
      // 固定返回的模拟用户信息
      const userInfo = {
        data: {
          userId: "0",
          userName: "Soybean",
          roles: ["R_SUPER"],
          buttons: ["B_CODE1", "B_CODE2", "B_CODE3"]
        },
        code: "0000",
        msg: "请求成功"
      };
      res.json(userInfo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };