# agora-chorus

agora web 大合唱解决方案

## **Config**

将 `.env.example` 改名为 `.env` , 并正确填写参数

```
VITE_AGORA_APP_ID=<#YOUR APP ID#>
VITE_AGORA_AUTHORIZATION=<#YOUR AUTHORIZATION#>
```

VITE_AGORA_AUTHORIZATION 为  base64_encode({key}:{secret})) 

具体查看：

https://docportal.shengwang.cn/cn/Agora%20Platform/faq/restful_authentication



## Install

安装依赖

```basic
yarn install 
```

## Run

开发环境运行

```bash
yarn dev
```

## Build

正式环境打包

```
yarn build
```

## Address

https://fullapp.oss-cn-beijing.aliyuncs.com/chorus/index.html

## Realize

主唱 role:host

* 加入 channel 频道 => uid：2 发人声流  uid：9528 发bgm流 => 开启云端合流服务

伴唱 role:accompaniment

* 加入 channel 频道 =>  发人声流

观众 role:audience

* 加入 channel_ad 频道 =>  接受云端合流之后的音频流





