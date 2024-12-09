import axios from "axios";
import {
  Avatar,
  Drawer,
  Dropdown,
  Navbar,
  Sidebar,
  useThemeMode,
} from "flowbite-react";
import { useState } from "react";
import { BiArrowFromLeft } from "react-icons/bi";
import { CgMenuLeftAlt } from "react-icons/cg";
import { FaRegSun } from "react-icons/fa";
import { LuMoon } from "react-icons/lu";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { clearUserData } from "../redux/authSlice";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { toggleMode, mode } = useThemeMode();
  const handleClose = () => setIsOpen(false);

  const { authenticated, userDetails, setUserDetails } = useAuth();

  if (!authenticated) {
    return null;
  }

  const onLogout = async () => {
    try {
      const apiToken = user?.data?.token;

      if (!apiToken) {
        throw new Error("Missing authorization token");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/signout`,
        null,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );
      localStorage.removeItem("userData");
      clearUserData();
      setUserDetails(null);
      window.location.href = "/signin";
    } catch (error) {
      console.error(error.message || "Error fetching user details");
      toast.error(error.message || "Error fetching user details");
    }
  };

  return (
    <>
      <Navbar fluid rounded className="bg-blue-400 dark:bg-slate-900">
        <Navbar.Brand>
          <CgMenuLeftAlt
            className="self-center text-2xl cursor-pointer mr-2"
            onClick={() => setIsOpen(true)}
          />
          <span
            className="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
            onClick={() => {
              navigate("/dashboard");
            }}
          >
            The ToDo App
          </span>
        </Navbar.Brand>

        <div className="flex md:order-2">
          <span
            className="cursor-pointer flex items-center mr-4"
            onClick={toggleMode}
          >
            {mode === "light" ? (
              <LuMoon size={"20"} className="text-white" />
            ) : (
              <FaRegSun size={"20"} className="text-yellow-300" />
            )}
          </span>
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="User settings"
                img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                rounded
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm"> {user?.data?.user?.name}</span>
              <span className="block truncate text-sm font-medium">
                {user?.data?.user?.email}
              </span>
            </Dropdown.Header>
            <Dropdown.Item
              onClick={() => {
                navigate("/dashboard");
              }}
            >
              Dashboard
            </Dropdown.Item>

            <Dropdown.Divider />
            <Dropdown.Item onClick={onLogout}>Sign out</Dropdown.Item>
          </Dropdown>
        </div>
      </Navbar>
      <Drawer open={isOpen} onClose={handleClose}>
        <Drawer.Header title="MENU" titleIcon={() => <></>} />
        <Drawer.Items>
          <Sidebar
            aria-label="Sidebar with multi-level dropdown example"
            className="[&>div]:bg-transparent [&>div]:p-0"
          >
            <div className="flex h-full flex-col justify-between py-2">
              <div>
                <form className="pb-3 md:hidden"></form>

                <Sidebar.Items>
                  <Sidebar.ItemGroup>
                    <Sidebar.Item
                      icon={BiArrowFromLeft}
                      as={Link}
                      to="/dashboard"
                    >
                      Dashboard
                    </Sidebar.Item>
                  </Sidebar.ItemGroup>
                  {user?.data?.user?.userType === "admin" ? (
                    <>
                      <Sidebar.ItemGroup>
                        <Sidebar.Item
                          icon={BiArrowFromLeft}
                          as={Link}
                          to="/user-management"
                        >
                          User Management
                        </Sidebar.Item>
                      </Sidebar.ItemGroup>
                    </>
                  ) : null}
                </Sidebar.Items>
              </div>
            </div>
          </Sidebar>
        </Drawer.Items>
      </Drawer>
    </>
  );
};

export default SideBar;
