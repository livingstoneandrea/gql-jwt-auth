import "dotenv/config"
import "reflect-metadata"
import express,{ Request, Response } from 'express'
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { userResolver } from "./UserResolver";
import { AppDataSource } from "./data-source";
import cookieParser from "cookie-parser";
import cors from 'cors'
import { verify } from "jsonwebtoken";
import { createAccessToken, createRefreshToken } from "./auth";
import { User } from "./entity/User";
import { sendRefreshToken } from "./sendRefreshToken";



(async ()=>{
    const app = express();
    app.use(cors({
        origin:"http://localhost:3000",
        credentials: true,
    }))
    app.use(cookieParser())

    app.get("/", (_req, res)=>{
        res.status(200).send("Hello")
    });

 

    app.post("/refresh_token", async (req: Request, res: Response): Promise<Response | any>=>{
        const token = req.cookies.jwt_id
        if (!token) {
            return res.send({ok: false, accessToken: ""})
        }
        let payload: any = null

        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!)
            
        } catch (err) {
            console.log(err)
            return res.send({ok: false, accessToken: ""})
        }

        //valid token
        const user = await AppDataSource.manager.findOneBy(User, {id: payload.userId})
        if (!user) {
            return res.send({ok: false, accessToken: ""})
        }

        if (user.tokenversion !== payload.tokenversion) {
            return res.send({ok: true, accessToken: ""})
        }

    
        sendRefreshToken(res, createRefreshToken(user))

        return res.send({ok: true, accessToken: createAccessToken(user)})
    })

    AppDataSource.initialize()
    .then(() => {})
    .catch((error) => console.log(error))

    const apolloServer = new ApolloServer({
       schema: await buildSchema({
        resolvers: [userResolver]
       }),

       context:({req, res})=> ({req, res})

    });

    await apolloServer.start();

    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(4000, ()=>{
        console.log("express server started ")
    })
})()



export { AppDataSource };

