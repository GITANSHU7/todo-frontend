import axios from "axios";
import {
  Button,
  Label,
  Modal,
  Pagination,
  Select,
  Table,
  TextInput,
} from "flowbite-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaEdit } from "react-icons/fa";
import { HiOutlineExclamationCircle, HiPlusCircle } from "react-icons/hi";
import { IoIosRefreshCircle } from "react-icons/io";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { modalTheme } from "../theme/modalTheme";
import { tableTheme } from "../theme/tableTheme";
import { useFormik } from "formik";
import * as Yup from "yup";

const UserList = () => {
  const createUserSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    username: Yup.string().required("Username is required"),
    userType: Yup.string().required("User Type is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const editUserSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    username: Yup.string().required("Username is required"),
    userType: Yup.string().required("User Type is required"),
  });

  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const apiToken = user?.data?.token;

  const loadUser = async () => {
    try {
      if (!apiToken) {
        throw new Error("Missing authorization token");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/list`,
        null,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );
      setLoading(false);
      setData(response?.data?.data);
    } catch (error) {
      console.error(error.message || "Error fetching user details");
      throw error;
    }
  };
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await loadUser();
      } catch (error) {
        console.error(error?.message || "Error in authentication check");
      }
    };

    checkAuth();
  }, []);

  const createFormik = useFormik({
    initialValues: {
      name: "",
      email: "",
      username: "",
      userType: "",
      password: "",
    },
    validationSchema: createUserSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (!apiToken) {
          throw new Error("Missing authorization token");
        }
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/user/create`,
          values,
          {
            headers: {
              Authorization: `Bearer ${apiToken}`,
            },
          }
        );
        await loadUser();
        toast.success("User created successfully");
        setCreateModalOpen(false);
        resetForm();
        createFormik.resetForm();
      } catch (error) {
        console.error(error.message || "Error creating user");
        toast.error(error?.response?.data?.message || "Failed to create user");
      }
    },
  });

  const editFormik = useFormik({
    initialValues: {
      name: "",
      email: "",
      username: "",
      userType: "",
    },
    validationSchema: editUserSchema,
    onSubmit: async (values) => {
      try {
        if (!apiToken || !userIdToDelete) {
          throw new Error("Missing authorization token or user ID");
        }
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/user/update/${userIdToDelete}`,
          values,
          {
            headers: {
              Authorization: `Bearer ${apiToken}`,
            },
          }
        );
        await loadUser();
        toast.success("User updated successfully");
        setEditModalOpen(false);
        editFormik.resetForm();
      } catch (error) {
        console.error(error.message || "Error updating user");
        toast.error("Failed to update user");
      }
    },
  });

  // Delete user
  const deleteUser = async () => {
    if (!userIdToDelete) return;

    try {
      if (!apiToken) {
        throw new Error("Missing authorization token");
      }

      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/user/delete/${userIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );
      await loadUser();
      toast.success("User deleted successfully");
      setDeleteModalOpen(false);
      setUserIdToDelete(null);
    } catch (error) {
      console.error(error.message || "Error deleting user");
      toast.error(error?.response?.data?.message || "Failed to delete user");
    }
  };

  // Get current data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const filteredData = Array.isArray(data)
    ? data.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const serialNumber = indexOfFirstItem + 1;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEditClick = (user) => {
    editFormik.setValues({
      name: user.name,
      email: user.email,
      username: user.username,
      userType: user.userType,
    });
    setUserIdToDelete(user._id);
    setEditModalOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (id) => {
    setUserIdToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleCreateClick = () => {
    setCreateModalOpen(true);
  };

  return (
    <>
      <div>
        <div className="p-4">
          <h1 className="my-6 sm:my-10 text-xl font-semibold dark:text-white">
            User List
            <div className="mt-4 sm:mt-0 sm:float-right sm:rtl:float-left">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 rtl:space-x-reverse">
                <Button color="gray" onClick={handleCreateClick}>
                  <HiPlusCircle className="mr-2 h-5 w-5" />
                  Add User
                </Button>
                <Button
                  color="gray"
                  onClick={() => {
                    loadUser();
                    toast.success("Record Refreshed");
                  }}
                  className="w-full sm:w-auto"
                >
                  <IoIosRefreshCircle className="mr-2 h-5 w-5" />
                  Refresh
                </Button>
              </div>
            </div>
          </h1>
          <div className="mb-3">
            <TextInput
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:max-w-xs"
            />
          </div>
          <div className="overflow-x-auto">
            <Table theme={tableTheme} striped={true}>
              <Table.Head>
                <Table.HeadCell>#</Table.HeadCell>
                <Table.HeadCell>name</Table.HeadCell>
                <Table.HeadCell>email</Table.HeadCell>
                <Table.HeadCell>username</Table.HeadCell>
                <Table.HeadCell>user Type</Table.HeadCell>
                <Table.HeadCell>action</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {loading
                  ? [...Array(itemsPerPage)].map((_, index) => (
                      <Table.Row
                        key={index}
                        className="bg-white dark:bg-gray-800"
                      >
                        <Table.Cell>
                          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-full animate-pulse"></div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-full animate-pulse"></div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-full animate-pulse"></div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-full animate-pulse"></div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-full animate-pulse"></div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-full animate-pulse"></div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  : currentData.map((user, index) => (
                      <Table.Row
                        key={index}
                        className="bg-white dark:bg-gray-800"
                      >
                        <Table.Cell>{serialNumber + index}</Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white ">
                          {user.name}
                        </Table.Cell>
                        <Table.Cell>{user.email}</Table.Cell>
                        <Table.Cell>{user.username}</Table.Cell>
                        <Table.Cell>{user.userType}</Table.Cell>
                        <Table.Cell className="flex flex-wrap gap-2">
                          <Button
                            color="blue"
                            pill
                            onClick={() => handleEditClick(user)}
                            size={"sm"}
                            className="w-full sm:w-auto"
                          >
                            <FaEdit size={"sm"} className="h-5 w-5" />
                          </Button>
                          <Button
                            color="failure"
                            pill
                            onClick={() => handleDeleteClick(user._id)}
                            size={"sm"}
                            className="w-full sm:w-auto"
                          >
                            <RiDeleteBin6Fill size={"sm"} className="h-5 w-5" />
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
              </Table.Body>
            </Table>
          </div>
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={paginate}
            />
          </div>
        </div>
      </div>

      {/* Delete User Modal */}
      <Modal
        show={deleteModalOpen}
        size="md"
        onClose={() => setDeleteModalOpen(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure? You want to delete this user
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={deleteUser}>
                Yes I'm sure
              </Button>
              <Button color="gray" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Create User Modal */}
      <Modal
        theme={modalTheme}
        show={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          createFormik.resetForm();
        }}
        // popup
        size="md"
        position={"center"}
      >
        <Modal.Header>Add User</Modal.Header>
        <Modal.Body>
          <form onSubmit={createFormik.handleSubmit}>
            <Label htmlFor="name" className="mb-2">
              Name
            </Label>
            <TextInput
              id="name"
              name="name"
              type="text"
              className="mt-2 mb-2"
              value={createFormik.values.name}
              onChange={createFormik.handleChange}
            />
            {createFormik.errors.name && (
              <p className="text-red-600">{createFormik.errors.name}</p>
            )}

            <Label htmlFor="email">Email</Label>
            <TextInput
              id="email"
              name="email"
              type="email"
              className="mt-2 mb-2"
              value={createFormik.values.email}
              onChange={createFormik.handleChange}
            />
            {createFormik.errors.email && (
              <p className="text-red-600">{createFormik.errors.email}</p>
            )}
            <Label htmlFor="password">Password</Label>
            <TextInput
              id="password"
              name="password"
              type="password"
              className="mt-2 mb-2"
              value={createFormik.values.password}
              onChange={createFormik.handleChange}
            />
            {createFormik.errors.password && (
              <p className="text-red-600">{createFormik.errors.password}</p>
            )}

            <Label htmlFor="username">Username</Label>
            <TextInput
              id="username"
              name="username"
              type="text"
              className="mt-2 mb-2"
              value={createFormik.values.username}
              onChange={createFormik.handleChange}
            />
            {createFormik.errors.username && (
              <p className="text-red-600">{createFormik.errors.username}</p>
            )}
            <Label htmlFor="userType">User Type</Label>
 
            <Select
              id="userType"
              name="userType"
              value={createFormik.values.userType}
              onChange={createFormik.handleChange}
              className="mt-2 mb-2"
            >
              <option value="">Select User Type</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </Select>
            {createFormik.errors.userType && (
              <p className="text-red-600">{createFormik.errors.userType}</p>
            )}

            <div className="flex justify-center gap-4 mt-4">
              <Button color="success" type="submit">
                save
              </Button>
              <Button
                color="gray"
                onClick={() => {
                  setCreateModalOpen(false);
                  createFormik.resetForm();
                }}
              >
                cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        theme={modalTheme}
        show={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        // popup
        size="md"
        position={"center"}
      >
        <Modal.Header>Edit User</Modal.Header>
        <Modal.Body>
          <form onSubmit={editFormik.handleSubmit}>
            <Label htmlFor="name">Name</Label>
            <TextInput
              id="name"
              name="name"
              type="text"
              className="mt-2 mb-2"
              value={editFormik.values.name}
              onChange={editFormik.handleChange}
            />
            {editFormik.errors.name && (
              <p className="text-red-600">{editFormik.errors.name}</p>
            )}

            <Label htmlFor="email">Email</Label>
            <TextInput
              id="email"
              name="email"
              type="email"
              className="mt-2 mb-2"
              value={editFormik.values.email}
              onChange={editFormik.handleChange}
            />
            {editFormik.errors.email && (
              <p className="text-red-600">{editFormik.errors.email}</p>
            )}

            <Label htmlFor="username">Username</Label>
            <TextInput
              id="username"
              name="username"
              type="text"
              value={editFormik.values.username}
              className="mt-2 mb-2"
              onChange={editFormik.handleChange}
            />
            {editFormik.errors.username && (
              <p className="text-red-600">{editFormik.errors.username}</p>
            )}

            <Label htmlFor="userType">User Type</Label>

            <Select
              id="userType"
              name="userType"
              value={editFormik.values.userType}
              onChange={editFormik.handleChange}
              className="mt-2 mb-2"
            >
              <option value="">Select User Type</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </Select>
            {editFormik.errors.userType && (
              <p className="text-red-600">{editFormik.errors.userType}</p>
            )}

            <div className="flex justify-center gap-4 mt-4">
              <Button color="success" type="submit">
                save
              </Button>
              <Button color="gray" onClick={() => setEditModalOpen(false)}>
                cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};
export default UserList;
