import { createContext , useEffect, useState} from "react";

export const appContext = createContext ();

export const AppProvider = ({children})=> {



    const [userDetails,setUserDetails] = useState ();
    const [isLogin,setIsLogin] = useState (!!localStorage.getItem ('token'));
    const [blogs,setBlogs] = useState ([]);
    const [category, setCategory] = useState("home");
    const [profile,setProfile] = useState ()

    useEffect (()=> {
        const stored = localStorage.getItem ('user');

        if (stored) {
            setUserDetails (JSON.parse (stored));
        }
    },[])


    useEffect (()=> {
        if (userDetails) {
            localStorage.setItem ('user',JSON.stringify (userDetails));
        }
    },[])
    
    return (<appContext.Provider value={{
        userDetails,
        setUserDetails,
        isLogin,
        setIsLogin,
        blogs,
        setBlogs,
        category,
        setCategory,
    }}>{children}

    </appContext.Provider>
    )
}