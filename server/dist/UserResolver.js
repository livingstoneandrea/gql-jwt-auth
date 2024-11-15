"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolver = void 0;
const type_graphql_1 = require("type-graphql");
const User_1 = require("./entity/User");
const index_1 = require("./index");
const bcryptjs_1 = require("bcryptjs");
const auth_1 = require("./auth");
const isAuth_1 = require("./isAuth");
const sendRefreshToken_1 = require("./sendRefreshToken");
let LoginResponse = class LoginResponse {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], LoginResponse.prototype, "accessToken", void 0);
LoginResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], LoginResponse);
let userResolver = class userResolver {
    hello() {
        return "hi!";
    }
    bye({ payload }) {
        return `your user id is: ${payload.userId}`;
    }
    async users() {
        return await index_1.AppDataSource.manager.find(User_1.User);
    }
    async revokeRefreshTokenForuser(userId) {
        await index_1.AppDataSource.getRepository(User_1.User).increment({ id: userId }, "tokenversion", 1);
        return true;
    }
    async login(email, password, { res }) {
        const user = await index_1.AppDataSource.manager.findOne(User_1.User, { where: { email } });
        if (!user) {
            throw new Error("could not find user");
        }
        const valid = await (0, bcryptjs_1.compare)(password, user.password);
        if (!valid) {
            throw new Error("invalid credentials");
        }
        (0, sendRefreshToken_1.sendRefreshToken)(res, (0, auth_1.createRefreshToken)(user));
        return {
            accessToken: (0, auth_1.createAccessToken)(user)
        };
    }
    async register(email, password) {
        const hashedPassword = await (0, bcryptjs_1.hash)(password, 14);
        try {
            const user = new User_1.User();
            user.email = email;
            user.password = hashedPassword;
            await index_1.AppDataSource.manager.save(user);
        }
        catch (err) {
            console.log(err);
            return false;
        }
        return true;
    }
};
exports.userResolver = userResolver;
__decorate([
    (0, type_graphql_1.Query)(() => String),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], userResolver.prototype, "hello", null);
__decorate([
    (0, type_graphql_1.Query)(() => String),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], userResolver.prototype, "bye", null);
__decorate([
    (0, type_graphql_1.Query)(() => [User_1.User]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], userResolver.prototype, "users", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("userId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], userResolver.prototype, "revokeRefreshTokenForuser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => LoginResponse),
    __param(0, (0, type_graphql_1.Arg)('email')),
    __param(1, (0, type_graphql_1.Arg)('password')),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], userResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)('email')),
    __param(1, (0, type_graphql_1.Arg)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], userResolver.prototype, "register", null);
exports.userResolver = userResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], userResolver);
//# sourceMappingURL=UserResolver.js.map