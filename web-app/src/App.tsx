import React, { useEffect, useState } from 'react';
import { Link, Outlet, Route, Routes } from 'react-router-dom';
import {Home} from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Bye } from './pages/Bye';
import { setAccessToken } from './accessToken';
import { useLogoutMutation, useMeQuery } from './gql/graphql';



function App() {
  const [loading, setLoading] = useState(true)
 

  useEffect(() => {
    fetch("http://localhost:4000/refresh_token",{method:"POST", credentials:"include"})
    .then(async res =>{
      const {accessToken} = await res.json()
      console.log(accessToken)
      setAccessToken(accessToken)
      setLoading(false)
    } )
  
  }, [])
  

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="bye" element={<Bye />} />
        <Route path="*" element={<NoMatch />} />
      </Route>
    </Routes>
  );
}


function Layout() {
  const {data, loading} = useMeQuery()
  const [logout,{client}] = useLogoutMutation()

  let body: any = null
  if (loading) {
    body= null
  }else if (data && data.me) {
    body = <div>you are logged in as: {data.me.email}</div>
  }else{
    body = <div>not logged in</div>
  }


  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/register">register</Link>
          </li>
          <li>
            <Link to="/login">login</Link>
          </li>
          <li>
            <Link to="/bye">bye</Link>
          </li>
          {!loading && data && data.me ?( <li>
            
            <button onClick={async ()=>{
              await logout()

              setAccessToken("")
              client!.resetStore()

            }} >logout</button>
          </li>) : null
          }
        </ul>
      </nav>

      <hr />

      <Outlet />
      {body}
    </div>
  );
}



function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}

export default App;
