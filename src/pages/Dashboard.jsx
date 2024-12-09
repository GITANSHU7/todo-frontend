import axios from "axios";
import {
  Button, Label, Modal, Pagination, Select, Table,
  TextInput
} from "flowbite-react";
import { useFormik } from "formik";
import {  useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaEdit } from "react-icons/fa";
import { HiOutlineExclamationCircle, HiPlusCircle } from "react-icons/hi";
import { IoIosRefreshCircle } from "react-icons/io";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { tableTheme } from "../theme/tableTheme";
import { modalTheme } from "../theme/modalTheme";

const truncateText = (text, limit = 40) => {
  if (text.length > limit) {
    return text.substring(0, limit) + "...";
  }
  return text;
};

const Dashboard = () => {

  const createTodoSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    status: Yup.string().required("Status is required"),
  });

  const editTodoSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    status: Yup.string().required("Status is required"),
  });

  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [todoIdToDelete, setTodoIdToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [view, setView] = useState('');
  const navigation = useNavigate();

  const apiToken = user?.data?.token;

  const loadTodo = async () => {
    try {
      if (!apiToken) {
        throw new Error("Missing authorization token");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/todo/list`,
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
      console.error(error.message || "Error fetching todo details");
      throw error;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await loadTodo();
      } catch (error) {
        console.error(error?.message || "Error in authentication check");
      }
    };

    checkAuth();
  }, []);

  const createFormik = useFormik({
    initialValues: {
      title: "",
      description: "",
      status: "",
    },
    validationSchema: createTodoSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (!apiToken) {
          throw new Error("Missing authorization token");
        }
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/todo/create`,
          values,
          {
            headers: {
              Authorization: `Bearer ${apiToken}`,
            },
          }
        );
        await loadTodo();
        toast.success("Todo created successfully");
        setCreateModalOpen(false);
        resetForm();
        createFormik.resetForm();
      } catch (error) {
        console.error(error.message || "Error creating todo");
        toast.error(error?.response?.data?.message || "Failed to create todo");
      }
    },
  });

  const editFormik = useFormik({
    initialValues: {
      title: "",
      description: "",
      status: "",
    },
    validationSchema: editTodoSchema,
    onSubmit: async (values) => {
      try {
        if (!apiToken || !todoIdToDelete) {
          throw new Error("Missing authorization token or todo ID");
        }
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/todo/update/${todoIdToDelete}`,
          values,
          {
            headers: {
              Authorization: `Bearer ${apiToken}`,
            },
          }
        );
        await loadTodo();
        toast.success("Todo updated successfully");
        setEditModalOpen(false);
        editFormik.resetForm();
      } catch (error) {
        console.error(error.message || "Error updating todo");
        toast.error(error?.response?.data?.message || "Failed to update todo");
      }
    },
  });

  const deleteTodo = async () => {
    if (!todoIdToDelete) return;

    try {
      if (!apiToken) {
        throw new Error("Missing authorization token");
      }

      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/todo/delete/${todoIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );
      await loadTodo();
      toast.success("Todo deleted successfully");
      setDeleteModalOpen(false);
      setTodoIdToDelete(null);
    } catch (error) {
      console.error(error.message || "Error deleting todo");
      toast.error(error?.response?.data?.message || "Failed to delete todo");
    }
  };

  // Get current data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const filteredData = Array.isArray(data)
    ? data.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          todo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          todo.status.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const serialNumber = indexOfFirstItem + 1;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEditClick = (todo) => {
    editFormik.setValues({
      title: todo.title,
      description: todo.description,
      status: todo.status,
    });
    setTodoIdToDelete(todo._id);
    setEditModalOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (id) => {
    setTodoIdToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleCreateClick = () => {
    setCreateModalOpen(true);
  };

  const handleViewClick = (todo) => {
    setViewModalOpen(true);
    setView(todo);
  }

  return (
    <>
    
      <div className="">
        <div className="p-4">
          <h1 className="my-6 sm:my-10 text-xl font-semibold dark:text-white">
            Todo List
            <div className="mt-4 sm:mt-0 sm:float-right sm:rtl:float-left">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 rtl:space-x-reverse">
                <Button color="gray" onClick={handleCreateClick}>
                  <HiPlusCircle className="mr-2 h-5 w-5"  />
                  Add Todo
                </Button>
                <Button
                  color="gray"
                  onClick={() => {
                    loadTodo();
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
          {data.length === 0 ? (
        <div className="flex justify-center items-center h-[50vh] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
        Hey {user?.data?.user?.name}, Welcome to the dashboard! You have no todos yet.
      </div>
      ) : (<>
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
                <Table.HeadCell>title</Table.HeadCell>
                <Table.HeadCell>description</Table.HeadCell>
                <Table.HeadCell>status</Table.HeadCell>
                <Table.HeadCell>created by</Table.HeadCell>
                <Table.HeadCell>action</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {loading
                  ? [...Array(itemsPerPage)].map((_, index) => (
                      <Table.Row
                        key={index}
                        className="bg-slate-300 dark:bg-gray-800"
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
                  : currentData.map((todo, index) => (
                      <Table.Row
                        key={index}
                        className="bg-white dark:bg-gray-800"
                      >
                        <Table.Cell>{serialNumber + index}</Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-bold cursor-pointer underline text-blue-500 dark:text-white"   onClick={() => handleViewClick(todo)} >
                          {todo.title}
                        </Table.Cell>
                        <Table.Cell className="">{truncateText(todo.description)}</Table.Cell>
                        <Table.Cell>{todo.status}</Table.Cell>
                        <Table.Cell>{todo.user.name}</Table.Cell>
                        <Table.Cell className="flex flex-wrap gap-2">
                          <Button
                            color="blue"
                            pill
                            onClick={() => handleEditClick(todo)}
                            size={"sm"}
                            className="w-full sm:w-auto"
                          >
                            <FaEdit size={"sm"} className="h-5 w-5" />
                          </Button>
                          <Button
                            color="failure"
                            pill
                            onClick={() => handleDeleteClick(todo._id)}
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
          </>)}
        </div>
        
      </div>
      
      {/* Delete Todo Modal */}

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
              Are you sure? You want to delete this todo?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={deleteTodo}>
                Yes I'm sure
              </Button>
              <Button color="gray" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

        {/* Create Todo Modal */}
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
        <Modal.Header>Add Todo</Modal.Header>
        <Modal.Body>
          <form onSubmit={createFormik.handleSubmit}>
            <Label htmlFor="title" className="mb-2">
              Title
            </Label>
            <TextInput
              id="title"
              name="title"
              type="text"
              className="mt-2 mb-2"
              value={createFormik.values.title}
              onChange={createFormik.handleChange}
            />
            {createFormik.errors.title && (
              <p className="text-red-600">{createFormik.errors.title}</p>
            )}

            <Label htmlFor="description">Description</Label>
            <TextInput
              id="description"
              name="description"
              type="text"
              className="mt-2 mb-2"
              value={createFormik.values.description}
              onChange={createFormik.handleChange}
            />
            {createFormik.errors.description && (
              <p className="text-red-600">{createFormik.errors.description}</p>
            )}
            
            <Label htmlFor="status">Status</Label>
 
            <Select
              id="status"
              name="status"
              value={createFormik.values.status}
              onChange={createFormik.handleChange}
              className="mt-2 mb-2"
            >
              <option value="">Select Status</option>
              <option value="inactive">In-Active</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </Select>
            {createFormik.errors.status && (
              <p className="text-red-600">{createFormik.errors.status}</p>
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

      {/* Edit Todo Modal */}
      <Modal
        theme={modalTheme}
        show={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        // popup
        size="md"
        position={"center"}
      >
        <Modal.Header>Edit Todo</Modal.Header>
        <Modal.Body>
          <form onSubmit={editFormik.handleSubmit}>
            <Label htmlFor="title">Title</Label>
            <TextInput
              id="title"
              name="title"
              type="text"
              className="mt-2 mb-2"
              value={editFormik.values.title}
              onChange={editFormik.handleChange}
            />
            {editFormik.errors.title && (
              <p className="text-red-600">{editFormik.errors.title}</p>
            )}

            <Label htmlFor="description">Description</Label>
            <TextInput
              id="description"
              name="description"
              type="text"
              className="mt-2 mb-2"
              value={editFormik.values.description}
              onChange={editFormik.handleChange}
            />
            {editFormik.errors.description && (
              <p className="text-red-600">{editFormik.errors.description}</p>
            )}

          
            <Label htmlFor="status">Status</Label>

            <Select
              id="status"
              name="status"
              value={editFormik.values.status}
              onChange={editFormik.handleChange}
              className="mt-2 mb-2"
            >
              <option value="">Select Status</option>
              <option value="inactive">In-Active</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </Select>
            {editFormik.errors.status && (
              <p className="text-red-600">{editFormik.errors.status}</p>
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

      {/* view modal */}
      <Modal
        show={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        size="md"
        position="center"
      >
        <Modal.Header>View Todo</Modal.Header>
        <Modal.Body>
          <div>
            <Label htmlFor="title" className="mb-2" >Title</Label>
            <h1 className="text-lg font-semibold dark:text-white mb-2">
              {view?.title}
            </h1>
            <Label htmlFor="description" className="mb-2" >Description</Label>
            <p className="text-lg font-semibold dark:text-white mb-2">
              {view?.description}
            </p>
            <Label htmlFor="status" className="mb-2" >Status</Label>
            <p className="text-lg font-semibold dark:text-white mb-2">
              {view?.status}
            </p>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Dashboard;
