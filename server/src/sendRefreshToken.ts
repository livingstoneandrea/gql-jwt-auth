import { Response } from "express";


export const sendRefreshToken = (res: Response, token: string) =>{
    res.cookie("jwt_id", token, {
        httpOnly:true,
        path:"/refresh_token"
    })
}