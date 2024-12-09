import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(true);
  const [userDetails, setUserDetails] = useState(null);   

  useEffect(() => {
    const store = JSON.parse(localStorage.getItem("userData") || "{}");
    const apiToken = store?.data?.token;
    if (!apiToken) {
      setAuthenticated(false);
    } else {
      setAuthenticated(true);
        setUserDetails(store);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ authenticated, userDetails, setAuthenticated, setUserDetails }}
    >
      {children}
    </AuthContext.Provider>
  );
};
