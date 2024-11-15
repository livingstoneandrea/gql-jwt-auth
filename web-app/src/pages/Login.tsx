import React, { useState } from 'react'
import { MeDocument, MeQuery, useLoginMutation } from '../gql/graphql'
import { redirect } from 'react-router-dom'
import { setAccessToken } from '../accessToken'




export const Login: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [login] = useLoginMutation()

  return (
    <form onSubmit={
        async e => {
            e.preventDefault();
            const response = await login({variables:{
                email,
                password
            },
            update: (store,{data}) => {
                if (!data) {
                    return null
                }

                store.writeQuery<MeQuery>({
                    query: MeDocument,
                    data: {
                        // __typename: "Query",
                        me: data.login.user
                    } 
                })
            }
        
        })

            console.log(response)

            if (response && response.data) {
                setAccessToken(response.data.login.accessToken) 
            }

            redirect("/")

        }
        
    }>
        <div>
            <input type="email" value={email} placeholder='email' onChange={e=> {
                setEmail(e.target.value)
            }} />
        </div>
        <div>
            <input type="password" value={password} placeholder='password' onChange={e=> {
                setPassword(e.target.value)
            }} />
        </div>
        <button type="submit">login</button>
    </form>
  )
}

