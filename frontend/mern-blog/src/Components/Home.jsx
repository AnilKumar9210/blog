import React, { useContext, useEffect } from 'react'
import Leftsec from './Leftsec'
import Rightsec from './Rightsec'
import { appContext } from '../Context/context'

const Home = () => {
  const {setUserDetails} = useContext (appContext)

  useEffect (()=> {
    const storedUser = localStorage.getItem ('user')
    if (storedUser) {
      setUserDetails (JSON.parse (storedUser)
      );
    }
  },[])
  return (
    <div className='home'>
      <Rightsec/>
      <Leftsec/>
    </div>
  )
}

export default Home
