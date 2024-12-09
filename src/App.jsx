import { Flowbite } from "flowbite-react";
import { Toaster } from "react-hot-toast";
import {
  Route,
  BrowserRouter as Router,
  Routes
} from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./Context/AuthContext";
import PrivateRoute from "./Context/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import NotAuthorized from "./pages/NotAuthorized";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import UserList from "./pages/UserList";

function App() {
  return (
    <>
      <AuthProvider>
        <Flowbite>
          <Toaster />

          <Router>
            <Routes>
              <Route element={<PrivateRoute />}>
               
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/user-management" element={<UserList />} />  
                <Route path="/not-authorized" element={<NotAuthorized />} />
                
              </Route>
              <Route path="/signin" element={<Signin />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </Router>
        </Flowbite>
      </AuthProvider>
      {/* <Signup /> */}
    </>
  );
}

export default App;
