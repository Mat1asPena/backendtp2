const serverlessExpress = require('@vendia/serverless-express');
const { AppModule } = require('../dist/app.module');
const { NestFactory } = require('@nestjs/core');

let server;

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    return serverlessExpress({ app: expressApp });
    }

    module.exports = async function handler(req, res) {
    if (!server) {
        server = await bootstrap();
    }
    return server(req, res);
};