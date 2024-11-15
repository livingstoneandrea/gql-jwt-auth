import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloClient,InMemoryCache, ApolloProvider,createHttpLink, ApolloLink, Observable } from '@apollo/client';


import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { getAccessToken, setAccessToken } from './accessToken';
import { TokenRefreshLink } from "apollo-link-token-refresh"
import { jwtDecode } from 'jwt-decode';


const requestLink = new ApolloLink(
  (operation, forward) => new Observable(observer => {
    let handle: any;
    Promise.resolve(operation).then(operation =>{
      const accessToken = getAccessToken()
      if (accessToken) {
        operation.setContext({
          headers:{
            authorization: `bearer ${accessToken}`
          }
        })
      }
    })
    .then(()=>{
      handle = forward(operation).subscribe({
        next: observer.next.bind(observer),
        error: observer.error.bind(observer),
        complete: observer.complete.bind(observer)

      })
    }).catch(observer.error.bind(observer));
    return ()=>{
      if (handle) handle.unsubscribe()
    }
  })
);

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials:"include"
});


const client = new ApolloClient({
  link: ApolloLink.from([
    new TokenRefreshLink({
      accessTokenField: "accessToken",
      isTokenValidOrUndefined: async()=> {
        const token = getAccessToken()

        if (!token) {
          return true
        }
        try {
          const {exp} = jwtDecode(token)
          if (Date.now() >= exp! * 1000) {
            return false
          }else{
            return true
          }

        } catch (error) {
          console.log(error)
          return false
        }
      },
      fetchAccessToken: ()=>{
        return fetch("http://localhost:4000/refresh_token",{
          method: "POST",
          credentials:"include"
        })
      },
      handleFetch: accessToken =>{
        setAccessToken(accessToken)
      },
      handleError: err =>{
        console.warn("Your refresh token is invalid. Try to relogin")
        console.error(err)
      }
    }),
    // onError(({graphQLErrors, networkError})=>{
    //   console.log(graphQLErrors);
    //   console.log(networkError);

    // })
    
    requestLink,
    httpLink
  ]),
  cache: new InMemoryCache(),
  
});


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <ApolloProvider client={client}>
     <React.StrictMode>
     <BrowserRouter> 
      <App />
     </BrowserRouter>
     </React.StrictMode>
  </ApolloProvider>
 
);


