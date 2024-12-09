import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SideBar from "../conponents/SideBar";
import AppFooter from "../conponents/Footer";


const PrivateRoutes = () => {
  const { authenticated } = useAuth();
  return authenticated ? (
    <>
      <SideBar />
      <div className="min-h-screen bg-slate-200 dark:bg-slate-800">
        <Outlet />
      </div>
      <AppFooter />
    </>
  ) : (
    <Navigate to="/signin" />
  );
};

export default PrivateRoutes;
