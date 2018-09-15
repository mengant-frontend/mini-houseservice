# housekeeping-service
家政维修服务小程序
## 快速上手
### 开发之前
#### 安装依赖
使用yarn
```
yarn install
```
使用npm
```
npm install
```
#### 开发
```
yarn watch
```
请尽量使用最新的es语法开发，请使用async,await处理异步
#### 构建部署
```
yarn build
```
# iView Weapp

### 一套高质量的微信小程序 UI 组件库

## 文档
[https://weapp.iviewui.com](https://weapp.iviewui.com)

## 体验
使用微信扫一扫体验小程序组件示例

<img width="200" src="https://raw.githubusercontent.com/TalkingData/iview-weapp/master/assets/code.jpg">
### 使用之前
在开始使用 iView Weapp 之前，你需要先阅读 [微信小程序自定义组件](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/) 的相关文档。

### 如何使用
1. 添加需要的组件。在页面的 json 中配置（路径根据自己项目位置配置）：
```json
"usingComponents": {
    "i-button": "../../ivew/button/index"
}
```
2. 在 wxml 中使用组件：
```html
<i-button type="primary" bind:click="handleClick">这是一个按钮</i-button>
```
### 小程序开发资源
(http://www.cnblogs.com/zxj95121/p/9224163.html)
Copyright (c) 2018-present, lifuzhao