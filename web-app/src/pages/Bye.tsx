import React from 'react'
import { useByeQuery } from '../gql/graphql'

export const Bye = () => {
  const {data,loading, error} = useByeQuery({
    fetchPolicy: "network-only"
  })
  if (loading) {
    return <div>loading...</div>
  }
  if (error) {
    console.log(error)
    return <div>error</div>
  }
  return (
    <div>{data?.bye}</div>
  )
}
