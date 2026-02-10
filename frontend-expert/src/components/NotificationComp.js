import { Menu } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import { FaBirthdayCake } from "react-icons/fa";
import { BiCalendar } from "react-icons/bi";
import { io } from "socket.io-client";
import { useDoctorAuthStore } from "../store/useDoctorAuthStore";
import axios from "axios";
import toast from "react-hot-toast";
import socket from "../utils/socket";

// Socket instance (keep it outside component to avoid multiple connections)
// const socket = io("http://localhost:6060", {
//   transports: ["websocket"],
// });

function NotificationComp({ renderButton }) {
  const [notifications, setNotifications] = useState([]);
  const { doctor } = useDoctorAuthStore();

  // useEffect(() => {
  //   if (!doctor?.docRefId) return;

  //   // Join doctor-specific room
  //   console.log("Joining doctor room:", doctor.docRefId);
  //   socket.emit("join-doctor", doctor.docRefId);

  //   // Listen for real-time appointment events
  //   socket.on("receive-appointment", (data) => {
  //     console.log("Received appointment notification:", data);
  //     setNotifications((prev) => [data, ...prev]);
  //   });

  //   // Cleanup on unmount
  //   return () => {
  //     socket.off("receive-appointment");
  //   };
  // }, [doctor?.docRefId]);
  useEffect(() => {
    // Make sure doctor info is available
    if (doctor?._id) {
      console.log("Registering doctor with socket:", doctor._id);
      socket.emit("registerUser", doctor._id);
    }
    socket.on("appointment-received", (data) => {
      console.log("Received appointment notification:", data);
      setNotifications((prev) => {
      // Remove any existing notification with the same id
      const filtered = prev.filter((n) => n.id !== data.id);
      return [data, ...filtered];
    });
    });

    // Cleanup
    // return () => {
    //   socket.off("appointment-received");
    // };
  }, [doctor?._id]);

  const handleMarkAllRead = () => {
    setNotifications([]);
  };

  //   const handleApprove = async (id) => {
  //   try {
  //     const res = await axios.put(
  //       `${process.env.REACT_APP_SERVER_BASE_URL}/user/appointments/${id}`,
  //       { status: "Approved" }
  //     );
  //     toast.success("Appointment approved!", { position: "top-center" });
  //     // console.log("✅ Appointment approved, new status:", res.data.data.status);
  //     setNotifications((prev) => prev.filter((n) => n.id !== id));
  //   } catch (err) {
  //     toast.error("❌ Failed to approve appointment!", { position: "top-center" });
  //   }
  // };
  const handleApprove = async (id) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/user/appointments/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "Approved" }),
          credentials: "include",
        }
      );

      const data = await res.json();
      if (res.ok) {
      // Emit socket event after successful update
      socket.emit("appointment-updated", {
        doctorId: data.data.doctorId, // make sure backend sends doctorId
        status: "Approved",
      });

      toast.success("Appointment approved!", { position: "top-center" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } else {
      throw new Error(data.message || "Failed to approve");
    }
    } catch (err) {
      toast.error("❌ Failed to approve appointment!", {
        position: "top-center",
      });
    }
  };

  // const handleReject = async (id) => {
  //   try {
  //     const res = await axios.put(
  //       `${process.env.REACT_APP_SERVER_BASE_URL}/user/appointments/${id}`,
  //       { status: "Cancelled" },
  //         { credentials: "include" }
  //     );
  //     toast("Appointment rejected!", {
  //       icon: "❌",
  //       position: "top-center",
  //     });
  //     // console.log("❌ Appointment rejected, new status:", res.data.data.status);
  //     setNotifications((prev) => prev.filter((n) => n.id !== id));
  //   } catch (err) {
  //      toast.error("❌ Failed to approve appointment!", {
  //       position: "top-center",
  //     });
  //   }
  // };

  const handleReject = async (id) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/user/appointments/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "Cancelled" }),
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
      // Emit socket event after successful update
      socket.emit("appointment-updated", {
        doctorId: data.data.doctorId, // same as approve
        status: "Cancelled",
      });

      toast("Appointment rejected!", {
        icon: "❌",
        position: "top-center",
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } else {
      throw new Error(data.message || "Failed to reject");
    }
    } catch (err) {
      toast.error("❌ Failed to approve appointment!", {
        position: "top-center",
      });
    }
  };

  // Wrapper component to handle scroll
  const MenuContent = ({ close }) => {
    useEffect(() => {
      const handleScroll = () => {
        close();
      };

      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }, [close]);

    return (
      <>
        <Menu.Button>{renderButton(notifications.length)}</Menu.Button>
        <Menu.Items className='absolute right-0 top-20 z-50 flex w-full flex-col gap-4 rounded-md bg-white px-6 py-4 shadow-lg ring-1 ring-border focus:outline-none sm:w-8/12 md:w-6/12 xl:w-2/6'>
              <div className='flex-btn flex-wrap gap-4'>
                <h2 className='text-md font-medium text-main'>Notifications</h2>
                <button
                  onClick={handleMarkAllRead}
                  className='rounded-md px-4 py-2 text-sm text-subMain hover:bg-text'
                >
                  Mark all read
                </button>
              </div>

              <div className='flex max-h-[500px] flex-col gap-4 overflow-y-scroll'>
                {notifications.length === 0 ? (
                  <p className='text-center text-sm text-gray-500'>
                    No notifications
                  </p>
                ) : (
                  notifications.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className='w-full rounded-lg border border-border p-4'
                    >
                      <div className='grid items-center gap-4 xs:grid-cols-12'>
                        <div className='xs:col-span-2'>
                          <div
                            className={`${
                              item.action === 1
                                ? "bg-subMain text-white"
                                : "bg-text text-subMain"
                            } text-md flex-colo h-12 w-12 rounded-full border-[.5px] border-subMain`}
                          >
                            {item.action === 1 ? <FaBirthdayCake /> : <BiCalendar />}
                          </div>
                        </div>
                        <div className='xs:col-span-10'>
                          <p className='text-sm text-textGray'>
                            {item.action === 1 ? (
                              <>
                                It's{" "}
                                <span className='font-medium text-main'>
                                  {item.user?.patientName || "Patient"}
                                </span>{" "}
                                birthday today
                              </>
                            ) : (
                              <>
                                New appointment with{" "}
                                <span className='font-medium text-main'>
                                  {item?.patientName || "Patient"} at{" "}
                                  <span className='font-xs text-main'>
                                    {new Date(item.startTime)
                                      .getUTCHours()
                                      .toString()
                                      .padStart(2, "0")}
                                    :
                                    {new Date(item.startTime)
                                      .getUTCMinutes()
                                      .toString()
                                      .padStart(2, "0")}{" "}
                                    on{" "}
                                    {new Date(item.startTime)
                                      .getUTCDate()
                                      .toString()
                                      .padStart(2, "0")}{" "}
                                    {new Date(item.startTime).toLocaleString(
                                      "en-GB",
                                      { month: "short", timeZone: "UTC" }
                                    )}{" "}
                                    {new Date(item.startTime).getUTCFullYear()}
                                  </span>
                                </span>
                              </>
                            )}
                          </p>
                          <div className='flex-btn gap-4'>
                            <p className='mt-2 text-xs font-light text-textGray'>
                              {new Date().toLocaleTimeString([], {
                                hour: "2-digit",
                                hour12: true,
                                minute: "2-digit",
                              })}{" "}
                              on{" "}
                              {new Date().toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          {/* ✅ Approve / Reject buttons only for appointments */}
                          {item.action !== 1 && (
                            <div className='mt-3 flex gap-3'>
                              <button
                                onClick={() => handleApprove(item.id)}
                                className='rounded-md bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600'
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleReject(item.id)}
                                className='rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600'
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
        </Menu.Items>
      </>
    );
  };

  return (
    <Menu>
      {({ close }) => <MenuContent close={close} />}
    </Menu>
  );
}

export default NotificationComp;
