# react-edukg
Frontend of Edukg (K12 Education Knowledge Graph) system build with React.

1.环境

需要安装nodeJS: https://nodejs.org/en/download/

检查npm是否已自动安装: npm -v

需要安装node进程管理工具pm2: npm install -g pm2

需要安装git: https://www.liaoxuefeng.com/wiki/896043488029600/896067074338496

2.构建

git clone https://github.com/Dreamycqy/react-edukg.git

进入目录

npm run build

自动拉取master最新commit，安装依赖环境，构建并执行pm2进程，启动服务器，端口号8567

3.本地开发

需要安装包管理工具yarn: npm i yarn -g

安装各项依赖: yarn install

目录下启动前端，端口号8765: npm run start

目录下启动代理服务器（用于跨域），端口号8567: npm run server
