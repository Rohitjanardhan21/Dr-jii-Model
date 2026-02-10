import React, { useEffect, useState, useMemo } from "react";
import Layout from "../Layout";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "react-modern-drawer/dist/index.css";
import {
  BiArrowBack,
  BiPlus,
  BiTrash,
  BiEdit,
  BiX,
  BiSearch,
} from "react-icons/bi";
import { FaCheck } from "react-icons/fa";
import DatePicker from "react-datepicker";

import {
  BsArrowDownLeft,
  BsArrowDownRight,
  BsArrowUpRight,
} from "react-icons/bs";

import DashboardSmallChart from "../components/Charts";

import { DashboardTransactionTable } from "./DashboardTransactionTable";
import TodaysAppointments from "./TodaysAppointments";
import Modal from "../components/Modals/Modal";
import CreatePatient from "./Patients/CreatePatient";

// import Drawer from "react-modern-drawer";

function Dashboard() {
  const [dashboardCards, setDashboardCards] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appointData, setAppointData] = useState([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);

  // To-Do + Notes states
  const [showTodoNotes, setShowTodoNotes] = useState(false);
  const [activeTab, setActiveTab] = useState("todo"); // "todo" or "notes"

  // Load tasks and notes from localStorage on mount
  const loadTasksFromStorage = () => {
    const stored = localStorage.getItem("dashboard_tasks");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((task) => ({
          ...task,
          date: new Date(task.date),
        }));
      } catch (e) {
        console.error("Error loading tasks from localStorage:", e);
      }
    }
    return [
      {
        id: 1,
        title: "Meeting with patient #12",
        time: "12:00",
        priority: "high",
        completed: false,
        date: new Date(),
      },
      {
        id: 2,
        title: "Check Documents",
        time: "1:30",
        priority: "medium",
        completed: false,
        date: new Date(),
      },
      {
        id: 3,
        title: "Prepare To-Do",
        time: "5:10",
        priority: "low",
        completed: false,
        date: new Date(),
      },
      {
        id: 4,
        title: "Order Medicines",
        time: "3:50",
        priority: "high",
        completed: false,
        date: new Date(),
      },
      {
        id: 5,
        title: "Check Reports",
        time: "1:10",
        priority: "medium",
        completed: true,
        date: new Date(),
      },
    ];
  };

  const loadNotesFromStorage = () => {
    const stored = localStorage.getItem("dashboard_notes");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((note) => ({
          ...note,
          date: new Date(note.date),
        }));
      } catch (e) {
        console.error("Error loading notes from localStorage:", e);
      }
    }
    return [
      {
        id: 1,
        title: "Lorem ipsum dolor",
        content:
          "Lorem ipsum dolor sit amet. Ut maiores illum aut repudiandae esse ut odit officiis et minima modi. Et omnis dicta non vitae sequi qui quia minima et rerum sequi sit suscipit sequi qui accusamus assumenda.",
        date: new Date(),
        image: null,
      },
      {
        id: 2,
        title: "Lorem ipsum dolor",
        content:
          "Lorem ipsum dolor sit amet. Ut maiores illum aut repudiandae esse ut odit officiis",
        date: new Date(),
        image: "placeholder",
      },
      {
        id: 3,
        title: "Lorem ipsum dolor",
        content:
          "Lorem ipsum dolor sit amet. Ut maiores illum aut repudiandae esse ut odit officiis et minima modi.",
        date: new Date(),
        image: null,
      },
    ];
  };

  const [tasks, setTasks] = useState(loadTasksFromStorage);
  const [notes, setNotes] = useState(loadNotesFromStorage);
  const [isAddTaskDrawerOpen, setIsAddTaskDrawerOpen] = useState(false);
  const [isAddNoteDrawerOpen, setIsAddNoteDrawerOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    date: new Date(),
    priority: "medium",
    time: "",
  });
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    image: null,
  });

  const navigate = useNavigate();

  const filteredPatients = useMemo(() => {
    return appointData?.filter((patient) =>
      (patient?.title || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [appointData, search]);

  useEffect(() => {
    const fetchYearlyStats = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/stats/yearly`,
          {
            credentials: "include",
          }
        );
        const result = await response.json();

        if (response.ok) {
          const stats = result;

          const patientsData = stats?.map(
            (item) => item.uniquePatientCount || 0
          );
          const appointmentsData = stats?.map(
            (item) => item.appointmentCount || 0
          );
          const earningsData = stats?.map((item) => item.totalEarnings || 0); // Commented out - earnings section disabled

          const totalPatients = patientsData?.reduce((a, b) => a + b, 0);
          const totalAppointments = appointmentsData?.reduce(
            (a, b) => a + b,
            0
          );
          const totalEarnings = earningsData?.reduce((a, b) => a + b, 0); // Commented out - earnings section disabled

          const prescriptionsData = [
            92, 80, 45, 15, 49, 77, 70, 51, 110, 20, 90, 60,
          ]; // Replace with real if needed
          const totalPrescriptions = prescriptionsData?.reduce(
            (a, b) => a + b,
            0
          );

          setDashboardCards([
            {
              id: 1,
              title: "Total Patients",
              icon: BsArrowDownLeft, // Or any icon you prefer
              value: totalPatients,
              percent: 45.06, // Replace with real growth logic if needed
              color: ["bg-subMain", "text-subMain", "#66B5A3"],
              datas: patientsData,
            },
            {
              id: 2,
              title: "Appointments",
              icon: BsArrowDownRight,
              value: totalAppointments,
              percent: 25.06,
              color: ["bg-yellow-500", "text-yellow-500", "#F9C851"],
              datas: appointmentsData,
            },
            {
              id: 3,
              title: "Prescriptions",
              icon: BsArrowUpRight,
              value: totalPrescriptions,
              percent: 65.06,
              color: ["bg-green-500", "text-green-500", "#34C759"],
              datas: prescriptionsData,
            },
            {
              id: 4,
              title: "Total Earnings",
              icon: BsArrowUpRight,
              value: "₹" + totalEarnings * 1000,
              percent: 45.06,
              color: ["bg-red-500", "text-red-500", "#FF3B30"],
              datas: earningsData,
            },
          ]);
        } else {
          console.error("Error fetching stats:", result.message);
        }
      } catch (error) {
        console.error("Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchYearlyStats();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      const res = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/payments?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await res.json();
      if (res.ok) {
        setPayments(result.data || []);
      } else {
        toast.error(result.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while fetching payments");
    } finally {
      setLoading(false);
    }
  };

  // Removed fetchTodaysAppointments - todaysAppointments state was not being used

  const fetchData = async () => {
    try {
      const getProfileId = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/patients`,
        {
          credentials: "include",
        }
      );
      const json = await getProfileId.json();
      setAppointData(json);
    } catch (e) {
      console.log("Error fetching data:", e);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchPayments(), fetchData()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("dashboard_tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem("dashboard_notes", JSON.stringify(notes));
  }, [notes]);

  // To-Do + Notes handlers
  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    // Format time from HH:MM to HH:MM format
    let formattedTime = newTask.time;
    if (formattedTime) {
      const [hours, minutes] = formattedTime.split(":");
      formattedTime = `${hours}:${minutes}`;
    } else {
      formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    if (editingTaskId) {
      // Edit existing task
      setTasks(
        tasks.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                title: newTask.title,
                description: newTask.description,
                time: formattedTime,
                priority: newTask.priority,
                date: newTask.date,
              }
            : task
        )
      );
      toast.success("Task updated successfully");
      setEditingTaskId(null);
    } else {
      // Add new task
      const task = {
        id: Date.now(),
        title: newTask.title,
        description: newTask.description,
        time: formattedTime,
        priority: newTask.priority,
        completed: false,
        date: newTask.date,
      };
      setTasks([...tasks, task]);
      toast.success("Task added successfully");
    }
    setNewTask({
      title: "",
      description: "",
      date: new Date(),
      priority: "medium",
      time: "",
    });
    setIsAddTaskDrawerOpen(false);
    setEditingTaskId(null);
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setNewTask({
      title: task.title,
      description: task.description || "",
      date: task.date,
      priority: task.priority,
      time: task.time || "",
    });
    setIsAddTaskDrawerOpen(true);
  };

  const handleToggleTask = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    toast.success("Task deleted");
  };

  const handleAddNote = () => {
    if (!newNote.content.trim()) {
      toast.error("Please enter a note");
      return;
    }

    if (editingNoteId) {
      // Edit existing note
      setNotes(
        notes.map((note) =>
          note.id === editingNoteId
            ? {
                ...note,
                title: newNote.title || newNote.content.substring(0, 30),
                content: newNote.content,
                image: newNote.image,
              }
            : note
        )
      );
      toast.success("Note updated successfully");
      setEditingNoteId(null);
    } else {
      // Add new note
      const note = {
        id: Date.now(),
        title: newNote.title || newNote.content.substring(0, 30),
        content: newNote.content,
        date: new Date(),
        image: newNote.image,
      };
      setNotes([note, ...notes]);
      toast.success("Note added successfully");
    }
    setNewNote({ title: "", content: "", image: null });
    setIsAddNoteDrawerOpen(false);
    setEditingNoteId(null);
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note.id);
    setNewNote({
      title: note.title,
      content: note.content,
      image: note.image,
    });
    setIsAddNoteDrawerOpen(true);
  };

  const handleDeleteNote = (noteId) => {
    setNotes(notes.filter((note) => note.id !== noteId));
    toast.success("Note deleted");
  };

  const handleAddTaskClick = () => {
    setEditingTaskId(null);
    setNewTask({
      title: "",
      description: "",
      date: new Date(),
      priority: "medium",
      time: "",
    });
    setIsAddTaskDrawerOpen(true);
  };

  const handleAddNoteClick = () => {
    setEditingNoteId(null);
    setNewNote({ title: "", content: "", image: null });
    setIsAddNoteDrawerOpen(true);
  };

  const handleClosePanel = () => {
    setIsAddTaskDrawerOpen(false);
    setIsAddNoteDrawerOpen(false);
    setEditingTaskId(null);
    setEditingNoteId(null);
    setNewTask({
      title: "",
      description: "",
      date: new Date(),
      priority: "medium",
      time: "",
    });
    setNewNote({ title: "", content: "", image: null });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    // If it's already in HH:MM format, return as is
    if (timeString.includes(":")) {
      return timeString;
    }
    return timeString;
  };

  // Sort tasks by time
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.time && b.time) {
      return a.time.localeCompare(b.time);
    }
    return 0;
  });

  const pendingTasks = sortedTasks.filter((task) => !task.completed);
  const doneTasks = sortedTasks.filter((task) => task.completed);

  // Remove full-page loading text; keep content rendering while data loads

  // Render To-Do + Notes view
  if (showTodoNotes) {
    return (
      <Layout>
        {/* Tab Navigation */}
        <div className='mb-6'>
          <div className='mb-4 flex items-center gap-4'>
            <button
              onClick={() => setShowTodoNotes(false)}
              className='flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100'
            >
              <BiArrowBack className='text-lg text-gray-700' />
            </button>
            <div className='flex items-center gap-1 border-b border-gray-200'>
              <button
                onClick={() => {
                  setActiveTab("todo");
                  handleClosePanel();
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "todo"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                To-Do
              </button>
              <button
                onClick={() => {
                  setActiveTab("notes");
                  handleClosePanel();
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "notes"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Notes
              </button>
            </div>
          </div>
        </div>

        {/* To-Do Tab */}
        {activeTab === "todo" && (
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {/* Left Side - Task List */}
            <div className='space-y-6'>
              {/* Top Action Bar */}
              <div className='mb-6 flex w-full items-center justify-start gap-3'>
                <button
                  onClick={handleAddTaskClick}
                  className='rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700'
                >
                  Add Task
                </button>
                <button className='rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50'>
                  Filters
                </button>
              </div>

              {/* Pending Tasks */}
              {pendingTasks.length > 0 && (
                <div className='space-y-3'>
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className='flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-md transition-all duration-200 hover:shadow-lg'
                    >
                      {/* Colored Left Bar - Thinner */}
                      <div
                        className={`h-16 w-1 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0`}
                      />

                      {/* Check Circle */}
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-white transition-all duration-200 hover:border-blue-500'
                      />

                      {/* Time, Title - Closer together and vertically centered */}
                      <div className='flex min-w-0 flex-1 items-center gap-2.5'>
                        <span className='min-w-[55px] flex-shrink-0 text-sm font-semibold text-gray-700'>
                          {formatTime(task.time)}
                        </span>
                        <span className='flex-1 truncate text-sm font-medium text-gray-900'>
                          {task.title}
                        </span>
                      </div>

                      {/* Action Buttons - Closer to right edge */}
                      <div className='flex flex-shrink-0 items-center gap-1.5 pr-1'>
                        <button
                          onClick={() => handleEditTask(task)}
                          className='rounded-lg p-1.5 text-gray-400 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-600'
                          title='Edit task'
                        >
                          <BiEdit className='text-base' />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className='rounded-lg p-1.5 text-gray-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600'
                          title='Delete task'
                        >
                          <BiTrash className='text-base' />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Done Tasks */}
              {doneTasks.length > 0 && (
                <div className='mt-10'>
                  <h3 className='mb-5 text-base font-semibold text-gray-700'>
                    Done ({doneTasks.length})
                  </h3>
                  <div className='space-y-3'>
                    {doneTasks.map((task) => (
                      <div
                        key={task.id}
                        className='flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-md'
                      >
                        {/* Colored Left Bar - Thinner */}
                        <div
                          className={`h-16 w-1 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0 opacity-60`}
                        />

                        {/* Check Circle with Checkmark */}
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-600 transition-all duration-200 hover:bg-blue-700'
                        >
                          <FaCheck className='text-[10px] text-white' />
                        </button>

                        {/* Time, Title - Closer together and vertically centered */}
                        <div className='flex min-w-0 flex-1 items-center gap-2.5'>
                          <span className='min-w-[55px] flex-shrink-0 text-sm font-semibold text-gray-500'>
                            {formatTime(task.time)}
                          </span>
                          <span className='flex-1 truncate text-sm font-medium text-gray-500 line-through'>
                            {task.title}
                          </span>
                        </div>

                        {/* Action Buttons - Closer to right edge */}
                        <div className='flex flex-shrink-0 items-center gap-1.5 pr-1'>
                          <button
                            onClick={() => handleEditTask(task)}
                            className='rounded-lg p-1.5 text-gray-400 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-600'
                            title='Edit task'
                          >
                            <BiEdit className='text-base' />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className='rounded-lg p-1.5 text-gray-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600'
                            title='Delete task'
                          >
                            <BiTrash className='text-base' />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingTasks.length === 0 && doneTasks.length === 0 && (
                <div className='py-16 text-center text-gray-500'>
                  <p className='text-base'>
                    No tasks yet. Add a new task to get started!
                  </p>
                </div>
              )}
            </div>

            {/* Right Side - Add/Edit Task Panel */}
            {isAddTaskDrawerOpen && (
              <div className='sticky top-6 h-[calc(100vh-200px)] overflow-y-auto rounded-xl bg-white p-6 shadow-lg'>
                {/* Header */}
                <div className='mb-6 flex items-center justify-between border-b border-gray-200 pb-4'>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    {editingTaskId ? "Edit Task" : "Add Task"}
                  </h2>
                  <button
                    onClick={handleClosePanel}
                    className='rounded-lg p-2 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700'
                    aria-label='Close'
                  >
                    <BiX className='text-2xl' />
                  </button>
                </div>

                {/* Form */}
                <div className='space-y-6'>
                  {/* Date */}
                  <div>
                    <label className='mb-2 block text-sm text-gray-600'>
                      Date
                    </label>
                    <div className='flex gap-3'>
                      <DatePicker
                        selected={newTask.date}
                        onChange={(date) =>
                          setNewTask({ ...newTask, date: date || new Date() })
                        }
                        dateFormat='d'
                        className='h-10 w-20 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 text-center text-base hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        showPopperArrow={false}
                        popperPlacement='bottom-start'
                      />
                      <DatePicker
                        selected={newTask.date}
                        onChange={(date) =>
                          setNewTask({ ...newTask, date: date || new Date() })
                        }
                        dateFormat='MMM'
                        className='h-10 w-24 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 text-center text-base hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        showPopperArrow={false}
                        popperPlacement='bottom-start'
                      />
                      <DatePicker
                        selected={newTask.date}
                        onChange={(date) =>
                          setNewTask({ ...newTask, date: date || new Date() })
                        }
                        dateFormat='yyyy'
                        className='h-10 w-28 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 text-center text-base hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        showPopperArrow={false}
                        popperPlacement='bottom-start'
                      />
                    </div>
                  </div>

                  {/* Time */}
                  <div>
                    <label className='mb-2 block text-sm text-gray-600'>
                      Time
                    </label>
                    <input
                      type='time'
                      value={newTask.time}
                      onChange={(e) =>
                        setNewTask({ ...newTask, time: e.target.value })
                      }
                      className='h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-base transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className='mb-2 block text-sm text-gray-600'>
                      Title
                    </label>
                    <input
                      type='text'
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      placeholder='Enter task title'
                      className='h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-base transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className='mb-2 block text-sm text-gray-600'>
                      Description{" "}
                      <span className='font-normal text-gray-400'>
                        (optional)
                      </span>
                    </label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                      placeholder='Enter task description'
                      rows={4}
                      className='w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-base transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className='mb-2 block text-sm text-gray-600'>
                      Priority
                    </label>
                    <div className='flex items-center gap-3'>
                      <button
                        onClick={() =>
                          setNewTask({ ...newTask, priority: "high" })
                        }
                        className={`h-5 w-5 rounded-full transition-all duration-200 ${
                          newTask.priority === "high"
                            ? "ring-2 ring-red-500 ring-offset-1"
                            : ""
                        } bg-red-500`}
                        title='High Priority'
                      />
                      <button
                        onClick={() =>
                          setNewTask({ ...newTask, priority: "medium" })
                        }
                        className={`h-5 w-5 rounded-full transition-all duration-200 ${
                          newTask.priority === "medium"
                            ? "ring-2 ring-yellow-500 ring-offset-1"
                            : ""
                        } bg-yellow-500`}
                        title='Medium Priority'
                      />
                      <button
                        onClick={() =>
                          setNewTask({ ...newTask, priority: "low" })
                        }
                        className={`h-5 w-5 rounded-full transition-all duration-200 ${
                          newTask.priority === "low"
                            ? "ring-2 ring-green-500 ring-offset-1"
                            : ""
                        } bg-green-500`}
                        title='Low Priority'
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className='border-t border-gray-200 pt-6'>
                    <button
                      onClick={handleAddTask}
                      className='w-full rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl'
                      aria-label={editingTaskId ? "Update Task" : "Add Task"}
                    >
                      {editingTaskId ? "Update Task" : "Add Task"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div className='space-y-6'>
            {/* Add a note... Input Field */}
            <div
              onClick={handleAddNoteClick}
              className='mb-6 flex w-full cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm transition-colors duration-200 hover:border-blue-500 hover:shadow-md'
            >
              <input
                type='text'
                placeholder='Add a note...'
                readOnly
                className='flex-1 cursor-pointer bg-transparent text-sm text-gray-500 outline-none'
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddNoteClick();
                }}
                className='rounded-lg p-2 text-gray-400 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-600'
                aria-label='Edit/Add note'
              >
                <BiEdit className='text-lg' />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Search functionality can be added here if needed
                }}
                className='rounded-lg p-2 text-gray-400 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-600'
                aria-label='Search notes'
              >
                <BiSearch className='text-lg' />
              </button>
            </div>

            {/* Notes Grid - Three Column Responsive */}
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {notes.map((note) => (
                <div
                  key={note.id}
                  className='relative flex h-full flex-col rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-md transition-all duration-200 hover:shadow-lg'
                >
                  {/* Date and Action Buttons */}
                  <div className='mb-2 flex items-start justify-between'>
                    <span className='text-[11px] font-normal text-gray-400'>
                      {note.date.toLocaleDateString("en-US", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <div className='flex flex-shrink-0 items-center gap-1'>
                      <button
                        onClick={() => handleEditNote(note)}
                        className='rounded-lg p-1.5 text-gray-400 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-600'
                        title='Edit note'
                      >
                        <BiEdit className='text-base' />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className='rounded-lg p-1.5 text-gray-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600'
                        title='Delete note'
                      >
                        <BiTrash className='text-base' />
                      </button>
                    </div>
                  </div>

                  {/* Blue Bullet + Title - Tighter alignment */}
                  <div className='mb-2 flex items-center gap-2'>
                    <div className='h-2 w-2 flex-shrink-0 rounded-full bg-blue-600' />
                    <h3 className='line-clamp-1 text-sm font-semibold text-gray-900'>
                      {note.title}
                    </h3>
                  </div>

                  {/* Description Text - Reduced spacing */}
                  <p className='mb-2 line-clamp-5 flex-1 text-xs leading-tight text-gray-600'>
                    {note.content}
                  </p>

                  {/* Image Placeholder - Figma dimensions */}
                  {note.image && (
                    <div className='mt-auto h-28 w-full rounded-lg bg-gray-200' />
                  )}
                </div>
              ))}
            </div>

            {notes.length === 0 && (
              <div className='py-16 text-center text-gray-500'>
                <p className='text-base'>
                  No notes yet. Add a new note to get started!
                </p>
              </div>
            )}

            {/* Add/Edit Note Modal - Full Screen Overlay */}
            {isAddNoteDrawerOpen && (
              <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
                <div className='max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-lg'>
                  {/* Header */}
                  <div className='mb-6 flex items-center justify-between border-b border-gray-200 pb-4'>
                    <h2 className='text-xl font-semibold text-gray-900'>
                      {editingNoteId ? "Edit Note" : "Add Note"}
                    </h2>
                    <button
                      onClick={handleClosePanel}
                      className='rounded-lg p-2 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700'
                      aria-label='Close'
                    >
                      <BiX className='text-xl' />
                    </button>
                  </div>

                  {/* Form */}
                  <div className='space-y-6'>
                    {/* Title */}
                    <div>
                      <label className='mb-2 block text-sm font-medium text-gray-700'>
                        Title
                      </label>
                      <input
                        type='text'
                        value={newNote.title}
                        onChange={(e) =>
                          setNewNote({ ...newNote, title: e.target.value })
                        }
                        placeholder='Enter note title'
                        className='h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-base transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className='mb-2 block text-sm font-medium text-gray-700'>
                        Description
                      </label>
                      <textarea
                        value={newNote.content}
                        onChange={(e) =>
                          setNewNote({ ...newNote, content: e.target.value })
                        }
                        placeholder='Enter note description'
                        rows={8}
                        className='w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-base transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex gap-3 border-t border-gray-200 pt-6'>
                    <button
                      onClick={handleClosePanel}
                      className='flex-1 rounded-xl border border-gray-300 bg-white py-3 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50'
                      aria-label='Cancel'
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddNote}
                      className='flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl'
                      aria-label={editingNoteId ? "Update Note" : "Add Note"}
                    >
                      {editingNoteId ? "Update" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      {/* To-Do + Notes Access Button */}
      <div className="mb-4 flex justify-end">
        {/* <button
          onClick={() => setShowTodoNotes(true)}
          className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700'
        >
          <BiPlus className='text-lg' />
          <span>To-Do & Notes</span>
        </button> */}
      </div>

      {/* Search Patients */}
      <div className='relative justify-between items-center flex mb-6  grid-cols-1 gap-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-7'>
        <input
          type="text"
          placeholder='Search "Patients"'
          className="h-11 rounded-md border border-border bg-dry px-4 text-sm text-main md:col-span-2 lg:col-span-3"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onBlur={() => {
            setTimeout(() => setShowDropdown(false), 150);
          }}
          onFocus={() => setShowDropdown(true)}
        />
        <button
          onClick={() => setShowTodoNotes(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <BiPlus className="text-lg" />
          <span>To-Do & Notes</span>
        </button>

        {showDropdown && search && (
          <ul className='absolute top-16 z-10 w-full max-w-xs rounded-md border border-gray-200 bg-white shadow-md md:col-span-2 lg:col-span-3'>
            {filteredPatients?.length > 0 &&
              filteredPatients.map((patient, idx) => (
                <li
                  key={idx}
                  className='flex cursor-pointer flex-row items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearch(patient?.title || "");
                    setShowDropdown(false);
                    navigate(`/patients/preview/${patient?._id}`);
                  }}
                >
                  <img
                    src={patient?.image}
                    loading='lazy'
                    decoding='async'
                    alt='Patient'
                    className='h-10 w-10 rounded-full border border-subMain object-cover'
                  />
                  <div className='flex flex-col'>
                    <h2 className='text-sm font-semibold'>{patient?.title}</h2>
                    <p className='text-xs text-textGray'>{patient?.email}</p>
                    <p className='text-xs'>{patient?.phone}</p>
                  </div>
                </li>
              ))}
            {/* Show "Add Patient" if no match */}
            {filteredPatients?.length === 0 && (
              <li
                className='flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-main hover:bg-gray-100'
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsAddPatientModalOpen(true);
                }}
              >
                <span className='text-xl font-bold'>+</span>
                <span>Add "{search}" as new patient</span>
              </li>
            )}
          </ul>
        )}
      </div>

      {/* boxes */}
      <div className='overflow-x-hidden'>
        <div className='grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {dashboardCards.map((card, index) => (
            <div
              key={card.id}
              className='rounded-xl border-[1px] border-border bg-white !p-5'
            >
              <div className='flex items-center gap-4'>
                <div
                  className={`flex-colo h-10 w-10 rounded-md bg-opacity-10 ${card.color[1]} ${card.color[0]}`}
                >
                  <card.icon />
                </div>
                <h2 className='text-sm font-medium'>{card.title}</h2>
              </div>
              <div className='mt-4 grid grid-cols-8 items-center gap-4 overflow-hidden rounded-xl bg-dry !px-8 !py-5'>
                <div className='col-span-5'>
                  {/* statistc */}
                  <div className='h-[80px] w-full sm:h-[90px]'>
                    <DashboardSmallChart
                      data={card.datas}
                      colors={card.color[2]}
                    />
                  </div>
                </div>
                <div className='col-span-3 flex flex-col gap-4'>
                  <h4 className='text-md font-medium'>
                    {card.value}
                    {
                      // if the id === 4 then add the $ sign
                      card.id === 4 ? "" : ""
                    }
                  </h4>
                  <p className={`flex gap-2 text-sm ${card.color[1]}`}>
                    {card.percent > 50 && <BsArrowUpRight />}
                    {card.percent > 30 && card.percent < 50 && (
                      <BsArrowDownRight />
                    )}
                    {card.percent < 30 && <BsArrowDownLeft />}
                    {card.percent}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className='my-6 grid w-full grid-cols-1 gap-6 xl:grid-cols-8'>
          <div className='w-full xl:col-span-6'>
            {/* Earning Reports Section - Commented Out */}
            {/* <div className='rounded-xl border-[1px] border-border bg-white p-5'>
              <div className='flex-btn gap-2'>
                <h2 className='text-sm font-medium'>Earning Reports</h2>
                <p className='flex items-center gap-4 text-sm'>
                  5.44%{" "}
                  <span className='rounded-xl bg-subMain px-2 py-1 text-xs text-white'>
                    +2.4%
                  </span>
                </p>
              </div>
              <div className='mt-4'>
                <DashboardBigChart data={dashboardCards[3]?.datas} />
              </div>
            </div> */}
            {/* transaction */}
            <div className='mt-6 rounded-xl border-[1px] border-border bg-white p-5'>
              <div className='flex-btn gap-2'>
                <h2 className='text-sm font-medium'>Recent Transaction</h2>
                <p className='flex items-center gap-4 text-sm'>
                  Today{" "}
                  <span className='rounded-xl bg-subMain px-2 py-1 text-xs text-white'>
                    27000$
                  </span>
                </p>
              </div>
              {/* table */}
              <div className='mt-4 overflow-x-scroll'>
                <DashboardTransactionTable data={payments} />
              </div>
            </div>
          </div>
          {/* side 2 */}
          <div
            data-aos='fade-left'
            data-aos-duration='1000'
            data-aos-delay='10'
            data-aos-offset='200'
            className='grid gap-6 sm:grid-cols-2 xl:col-span-2 xl:block'
          >
            {/* recent patients */}
            <div className='rounded-xl border-[1px] border-border bg-white !p-5'>
              <h2 className='text-sm font-medium'>Recent Patients</h2>
              {appointData?.slice(0, 5)?.map((member, index) => (
                <Link
                  to={`/patients/preview/${member?._id}`}
                  key={index}
                  className='flex-btn !mt-6 !gap-4 border-b !pb-4'
                >
                  <div className='flex items-center gap-4'>
                    <img
                      src={member?.image}
                      loading='lazy'
                      decoding='async'
                      alt='member'
                      className='h-10 w-10 rounded-md object-cover'
                    />
                    <div className='flex flex-col gap-1'>
                      <h3 className='text-xs font-medium'>{member?.title}</h3>
                      <p className='text-xs text-gray-400'>{member?.phone}</p>
                    </div>
                  </div>
                  <p className='text-xs text-textGray'>2:00 PM</p>
                </Link>
              ))}
            </div>
            {/* today appointments */}
            <TodaysAppointments />
          </div>
        </div>
      </div>

      {/* Create Patient Modal */}
      <Modal
        isOpen={isAddPatientModalOpen}
        closeModal={() => setIsAddPatientModalOpen(false)}
        title='Add New Patient'
      >
        <CreatePatient
          closeModal={() => setIsAddPatientModalOpen(false)}
          onSuccess={(newPatient) => {
            // Refresh patient data after successful creation
            fetchData();
            setSearch("");
            setIsAddPatientModalOpen(false);
          }}
        />
      </Modal>
    </Layout>
  );
}
export default Dashboard;
