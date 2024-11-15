import {Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx, UseMiddleware, Int} from 'type-graphql'
import { User } from './entity/User'
import { AppDataSource } from "./index"
import { compare, hash } from 'bcryptjs'
import { MyContext } from './MyContext'
import { createAccessToken, createRefreshToken } from './auth'
import { isAuth } from './isAuth'
import { sendRefreshToken } from './sendRefreshToken'
import { verify } from 'jsonwebtoken'



// const userRepository = AppDataSource.getRepository(User)


@ObjectType()
class LoginResponse{
    @Field()
    accessToken: string
    @Field(()=> User)
    user: User
}

@Resolver()
export class userResolver{
    @Query(()=> String)
    hello(){
        return "hi!"
    }

    @Query(()=> String)
    @UseMiddleware(isAuth)
    bye(@Ctx() {payload}: MyContext){
        return `your user id is: ${payload!.userId}`
    }


    @Query(()=> [User])
    async users(){
        return await AppDataSource.manager.find(User)
    }

    @Query(()=> User, {nullable: true})
    async me(@Ctx() context: MyContext){
        const authorization = context.req.headers['authorization'];
        if (!authorization) {
            return null
        }
        try {
            const token = authorization.split(" ")[1]
            const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!)
            //context.payload = payload as any
            return await AppDataSource.manager.findOne(User, {where :{id:payload.userId}})
        } catch (err) {
            console.log(err)
            return null
        }
    
    }


    @Mutation(()=> Boolean)
    async logout(@Ctx() {res}: MyContext){
        sendRefreshToken(res, "")
        
        return true
    }

    @Mutation(()=> Boolean)
    async revokeRefreshTokenForuser(@Arg("userId", ()=> Int) userId: number){
        await AppDataSource.getRepository(User).increment(
            {id: userId},
            "tokenversion",1
        )
        return true
    }

    @Mutation(()=> LoginResponse)
    async login(
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Ctx() {res}: MyContext
    ): Promise<LoginResponse> {
        
        const user = await AppDataSource.manager.findOne(User, {where :{email}})

        if (!user) {
            throw new Error("could not find user")
        }

        const valid = await compare(password, user.password)

        if (!valid) {
            throw new Error("invalid credentials")
        }
        
        //login success

        sendRefreshToken(res, createRefreshToken(user))

        return {
            accessToken: createAccessToken(user),
            user
        }
    }


    @Mutation(()=> Boolean)
    async register(
        @Arg('email') email: string,
        @Arg('password') password: string
    ){
        const hashedPassword =await hash(password, 14)

        try {

            const user = new User()
            user.email = email
            user.password = hashedPassword
            await AppDataSource.manager.save(user)

        } catch (err) {
            console.log(err)
            return false
        }
       
        return true
    }
}