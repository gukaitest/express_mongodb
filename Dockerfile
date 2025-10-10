# 使用官方Node.js镜像作为基础
FROM node:16-alpine

# 设置环境变量
ENV NODE_ENV=production

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动应用
# 注意：使用 node 直接启动，而不是 npm start
# 因为 npm start 依赖 cross-env（在 devDependencies 中，生产构建时不会安装）
# ENV NODE_ENV=production 已在上面设置，node 会自动读取
CMD ["node", "index.js"]