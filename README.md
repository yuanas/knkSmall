# knkSmall 微信小程序项目

## 项目概述
这是一个微信小程序项目，包含基本的页面功能和云函数集成。

## 项目结构
```
knkSmall/
├── app.js                # 小程序入口文件
├── app.json              # 小程序全局配置
├── project.config.json   # 项目配置文件
├── project.private.config.json # 私有项目配置
├── cloudfunctions/       # 云函数目录
│   └── login/            # 登录相关云函数
│       ├── index.js      # 云函数主文件
│       ├── package.json  # 云函数依赖
│       └── package-lock.json
├── models/               # 数据模型
│   └── card.js           # 卡片数据模型
├── pages/                # 页面目录
│   ├── edit/             # 编辑页面
│   │   ├── edit.js
│   │   ├── edit.json
│   │   ├── edit.wxml
│   │   └── edit.wxss
│   └── index/            # 首页
│       ├── index.js
│       ├── index.json
│       ├── index.wxml
│       └── index.wxss
└── services/             # 服务层
    └── storage.js        # 存储服务
```

## 开发环境要求
- Node.js 14+
- 微信开发者工具
- 微信小程序开发者账号

## 安装与运行
1. 克隆项目
2. 在微信开发者工具中导入项目
3. 安装云函数依赖：
   ```bash
   cd cloudfunctions/login
   npm install
   ```
4. 点击微信开发者工具中的"编译"按钮运行项目

## 主要功能
- 首页展示
- 编辑功能
- 登录功能（通过云函数实现）

## 云函数说明
`cloudfunctions/login` 目录包含登录相关的云函数实现，使用前需要：
1. 在微信开发者工具中上传并部署云函数
2. 在小程序管理后台配置云函数环境

## 注意事项
- 请确保project.private.config.json中的敏感信息已妥善处理
- 云函数部署前请检查package.json中的依赖版本
