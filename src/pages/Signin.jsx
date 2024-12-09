import { useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { setUserData } from "../redux/authSlice";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

const Signin = () => {
  const { authenticated, setAuthenticated } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Yup validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const onLogin = async (values) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        values
      );
      console.log(response.data);

      localStorage.setItem("userData", JSON.stringify(response.data));
      toast.success("Login successful")
      setAuthenticated(true);
      dispatch(setUserData(response.data));
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  };

  useEffect(() => {
    if (authenticated) {
      navigate("/dashboard");
    }
  }, [authenticated]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-200">
      <div className="flex-1 flex bg-white rounded-lg shadow-lg border border-neutral-100 overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
        <div
          className="hidden lg:block lg:w-1/2 bg-cover"
          style={{
            backgroundImage:
              "url('https://img.freepik.com/free-vector/login-concept-illustration_114360-739.jpg')",
            width: "50%",
          }}
        ></div>
        <div className="w-full p-8 lg:w-1/2">
          <h2 className="text-2xl font-semibold text-gray-700 text-center">
            The ToDo App
          </h2>
          <p className="text-xl text-gray-600 text-center">Welcome back!</p>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              onLogin(values);
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mt-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email Address
                  </label>
                  <Field
                    name="email"
                    type="email"
                    className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                    placeholder="Email"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Password
                  </label>
                  <Field
                    name="password"
                    type="password"
                    className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                    placeholder="Password"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
                <div className="mt-8">
                  <button
                    type="submit"
                    className={'bg-gray-700 text-white font-bold py-2 px-4 w-full rounded hover:bg-gray-600 '}
                    // disabled={isSubmitting}
                  >
                    Sign In
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <div className="mt-4 flex items-center justify-between">
            <span className="border-b w-1/5 md:w-1/4"></span>
            <p
              className="text-xs text-gray-500 uppercase cursor-pointer hover:text-cyan-600 "
              onClick={() => {
                navigate("/signup");
              }}
            >
              or sign up
            </p>
            <span className="border-b w-1/5 md:w-1/4"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;

