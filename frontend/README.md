# 运行指南

本项目由 [Create React App](https://github.com/facebook/create-react-app) 构建

## 运行步骤

1. 定位到项目根目录，如：

```bash
cd frontend
```

2. 复制 `.env.example` 文件为 `.env` 文件，按以下命令或手动复制:

```bash
cp .env.example .env
```

修改 `.env` 文件中的各项配置为您的实际配置; 注意：`REACT_APP_` 为必须添加的前缀；每次修改配置后，需要重新启动项目。

3. 执行以下代码以安装依赖:

```bash
npm install
```

4. 执行以下代码以启动项目:

```bash
npm run start
```

浏览器访问 [http://localhost:3000](http://localhost:3000) 打开项目。一般情况下，项目会自动打开浏览器访问。

如果您进行了编辑，页面将重新加载；错误将可在浏览器控制台中看到。

5. 打包项目

```bash
npm run build
```

将用于生产的应用程序构建到 `build` 文件夹中，可直接本地访问或部署到服务器。
它正确地将React捆绑在生产模式中，并优化构建以获得最佳性能。
请参阅有关[部署](https://facebook.github.io/create-react-app/docs/deployment)的部分了解更多信息。
