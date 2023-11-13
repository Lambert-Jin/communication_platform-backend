# communication_platform-backend

## 概述
与团队合作搭建了一个网络交流平台，使用Javascript和Node.js开发后端服务器，处理用户认证，数据储存，用户之间的实时通信。  
使用了RESTful API以实现前后端系统之间的交互，保证了有效的数据交互和用户体验。

## 学习总结
- 使用gitlab进行项目管理，学会了如何部署简单的CI，在代码集成时进行自动化测试，保证master分支上的代码始终是稳定的，防止误操作。
- 学会了如何发送request和解析response，同时引入了token的概念，使用http header传递token确保安全性。
- 在安全性方面，使用了随机生成的会话ID保护会话。同时只存储密码的哈希值而不是明文防止密码泄露。

