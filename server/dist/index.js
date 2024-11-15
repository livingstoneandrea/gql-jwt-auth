"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("dotenv/config");
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const UserResolver_1 = require("./UserResolver");
const data_source_1 = require("./data-source");
Object.defineProperty(exports, "AppDataSource", { enumerable: true, get: function () { return data_source_1.AppDataSource; } });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const jsonwebtoken_1 = require("jsonwebtoken");
const auth_1 = require("./auth");
const User_1 = require("./entity/User");
const sendRefreshToken_1 = require("./sendRefreshToken");
(async () => {
    const app = (0, express_1.default)();
    app.use((0, cookie_parser_1.default)());
    app.get("/", (_req, res) => {
        res.status(200).send("Hello");
    });
    app.post("/refresh_token", async (req, res) => {
        const token = req.cookies.jwt_id;
        if (!token) {
            return res.send({ ok: false, accessToken: "" });
        }
        let payload = null;
        try {
            payload = (0, jsonwebtoken_1.verify)(token, process.env.REFRESH_TOKEN_SECRET);
        }
        catch (err) {
            console.log(err);
            return res.send({ ok: false, accessToken: "" });
        }
        const user = await data_source_1.AppDataSource.manager.findOneBy(User_1.User, { id: payload.userId });
        if (!user) {
            return res.send({ ok: false, accessToken: "" });
        }
        if (user.tokenversion !== payload.tokenversion) {
            return res.send({ ok: true, accessToken: "" });
        }
        (0, sendRefreshToken_1.sendRefreshToken)(res, (0, auth_1.createRefreshToken)(user));
        return res.send({ ok: true, accessToken: (0, auth_1.createAccessToken)(user) });
    });
    data_source_1.AppDataSource.initialize()
        .then(() => {
    })
        .catch((error) => console.log(error));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [UserResolver_1.userResolver]
        }),
        context: ({ req, res }) => ({ req, res })
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
    app.listen(4000, () => {
        console.log("express server started ");
    });
})();
//# sourceMappingURL=index.js.map