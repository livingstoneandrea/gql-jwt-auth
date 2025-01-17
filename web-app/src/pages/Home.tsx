import React from 'react'
import { useUsersQuery } from '../gql/graphql'

export const Home = () => {
  const {data,} = useUsersQuery({fetchPolicy: "network-only"})
  if (!data) {
    return <div>loading ...</div>
  }
  return (
    <>
        <div>users:</div>
        <ul>
            {data.users.map(x => {
                return <li key={x.id}>{x.email}, {x.id}</li>
            })}
        </ul>
    </>
  )
}
