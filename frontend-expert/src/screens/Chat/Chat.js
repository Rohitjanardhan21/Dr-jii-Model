import React, { useState, useRef, useEffect } from "react";
// import { getLinkPreview } from 'link-preview-js';
import "./Chat.css";
// import user from '../assets/images/user.png';
// import image from '../assets/images/image.png';
import Layout from "../../Layout";
import { BsArrowUpCircleFill, BsPaperclip } from "react-icons/bs";
import { FaChevronDown } from "react-icons/fa";
import io from "socket.io-client";
import { MdGroupAdd, MdListAlt } from "react-icons/md";
import { AiOutlineUserAdd } from "react-icons/ai";
import { LuArrowDownToLine, LuMessageSquarePlus } from "react-icons/lu";
import { GoArrowLeft } from "react-icons/go";
import { RiRobot2Line, RiRobot2Fill } from "react-icons/ri";
import axios from "axios";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";
import Modal from "../../components/Modals/Modal";
import toast from "react-hot-toast";
const socket = io(`${process.env.REACT_APP_SOCKET_URL}`, {
  withCredentials: true, // As per backend suggestion
  transports: ['websocket'], // Try polling first, then websocket
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  autoConnect: true, // Ensure auto-connect is enabled
  forceNew: false, // Reuse existing connection if available
});

const Chat = () => {
  const [showList, setShowList] = useState(true);
  const [showAddList, setShowAddList] = useState(false);

  // Default to Dr. Jii: Ai Assistant chatbot
  const [selectedReceiverId, setSelectedReceiverId] = useState("chatbot");

  const [patientName, setPatientName] = useState("Dr. Jii: Ai Assistant");
  const [selectedContactImage, setSelectedContactImage] = useState(null);

  const handleNotebook = () => {
    setShowList(!showList);
  };

  const handleAddChat = () => {
    setShowAddList(!showAddList);
  };

  return (
    <Layout>
      <div
        className='flex h-full flex-row items-start justify-between overflow-hidden'
        style={{ maxHeight: "calc(120vh - 20px)" }}
      >
        <ChatList
          notebookClick={handleNotebook}
          showList={showList}
          showAddList={showAddList}
          handleAddChat={handleAddChat}
          onSelectReceiver={setSelectedReceiverId}
          setPatientName={setPatientName}
          setSelectedContactImage={setSelectedContactImage}
          selectedReceiverId={selectedReceiverId}
        />
        <Chats
          notebookClick={handleNotebook}
          showList={showList}
          selectedReceiverId={selectedReceiverId}
          patientName={patientName}
          selectedContactImage={selectedContactImage}
        />
      </div>
    </Layout>
  );
};

const ChatList = (props) => {
  const [msgs, setMsgs] = useState([]);
  const { doctor } = useDoctorAuthStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [emailChecked, setEmailChecked] = useState(false);
  const [smsChecked, setSmsChecked] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  // Default to chatbot selected since it's the default screen
  const [isChatBotSelected, setIsChatBotSelected] = useState(true);
  // const { orderId } = useParams();

  //   const order = {
  //   id: orderId,
  //   patient: {
  //     name: "Amani Mmasy",
  //     email: "amanimmasy@gmail.com",
  //     phone: "+254 712 345 678",
  //     avatar: "https://randomuser.me/api/portraits/men/75.jpg",
  //   },

  // };
  //const [msgs, setMsgs] = useState([]);

  useEffect(() => {
    const fetchChatList = async () => {
      try {
        // IMPORTANT: Always use _id (profile ID) for userId, never docRefId
        // This ensures consistency with socket registration and chat operations
        const userId = doctor._id?.toString();

        if (!userId) {
          return;
        }

        const res = await axios.post(
          `${process.env.REACT_APP_SERVER_BASE_URL}/user/getAll`,
          {
            userId: userId, // Uses _id (profile ID)
          }
        );

        if (res.data.success) {
          // Map the response from Chat model
          const mapped = res.data.usersWithLastMessage.map((item, index) => ({
            id: index + 1,
            userId: item.userId,
            sender: item.userName || "Unknown",
            text: item.lastMessage || "", // Can be empty for new chats
            image: item.userImage || "/default-user.png", // Backend now returns userImage
            timestamp: item.timestamp || new Date().toISOString(),
            unreadCount: item.unreadCount || 0, // Store unread count if needed
          }));

          setMsgs(mapped);
          // Don't auto-select first user - keep default chatbot selection
          // Only select first user if no receiver is currently selected (shouldn't happen with default chatbot)
          if (mapped.length > 0 && !props.selectedReceiverId) {
            props.onSelectReceiver(mapped[0].userId);
            props.setPatientName(mapped[0].sender);
          }
        }
      } catch (error) {
        // Error fetching chat list - silently fail
      }
    };

    if (doctor?._id) {
      fetchChatList();
    }
  }, [doctor?._id]);

  const [msgsFrequentChat, setMsgsFrequentChat] = useState([]);

  useEffect(() => {
    const fetchChatListByReceiver = async () => {
      try {
        // IMPORTANT: Always use _id (profile ID) for receiverId, never docRefId
        const receiverId = doctor._id?.toString(); // Use profile ID (_id), not docRefId

        if (!receiverId) {
          return;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_BASE_URL}/user/chatlist/receiver/${receiverId}`
        );

        if (response.data.success) {
          const mapped = response.data.chatList.map((msg, index) => ({
            id: index + 1,
            sender: msg?.senderName || "Unknown",
            email: msg?.senderEmail || "No email",
            image: msg?.senderImage || "/default-user.png",
          }));
          setMsgsFrequentChat(mapped);
        }
      } catch (err) {
        // Error fetching chat list by receiver - silently fail
      }
    };

    if (doctor?._id) {
      fetchChatListByReceiver();
    }
  }, [doctor?._id]);

  // Fetch patients when modal opens
  useEffect(() => {
    const fetchPatients = async () => {
      if (!isInviteModalOpen || !doctor?._id) return;
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/patients`,
          {
            credentials: "include",
          }
        );
        const json = await response.json();
        if (Array.isArray(json)) {
          setPatients(json);
        }
      } catch (error) {
        // Error fetching patients - silently fail
      }
    };

    fetchPatients();
  }, [isInviteModalOpen, doctor?._id]);

  // Fetch doctors when modal opens
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!isInviteModalOpen) return;
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/getAllDoctorProfileIdsInvite`,
          {
            credentials: "include",
          }
        );
        const json = await response.json();

        if (json.success && json.data && Array.isArray(json.data)) {
          // Filter out current doctor
          const otherDoctors = json.data.filter((doc) => {
            // Handle both _id and id fields
            const docId = doc._id || doc.id;
            const currentDoctorId = doctor?._id || doctor?.id;
            return docId !== currentDoctorId;
          });

          setDoctors(otherDoctors);
        } else {
          setDoctors([]);
        }
      } catch (error) {
        setDoctors([]);
      }
    };

    fetchDoctors();
  }, [isInviteModalOpen, doctor?._id]);

  // Filter results based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResults([]);
      setShowDropdown(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = [];

    // Search in patients
    patients.forEach((patient) => {
      const title = (patient?.title || "").toLowerCase();
      const email = (patient?.email || "").toLowerCase();
      const phone = (patient?.phone || "").toLowerCase();
      const uhiId = (patient?.uhiId || patient?.healthId || "").toLowerCase();

      if (
        title.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        uhiId.includes(query)
      ) {
        results.push({
          ...patient,
          type: "patient",
          displayName: patient?.title || "Unknown Patient",
          identifier:
            patient?.email ||
            patient?.phone ||
            patient?.uhiId ||
            patient?.healthId ||
            "",
        });
      }
    });

    // Search in doctors
    doctors.forEach((doc) => {
      // Check both flat and nested structures
      const fullName = (
        doc?.fullName ||
        doc?.personalDetails?.fullName ||
        doc?.docRefId?.fullName ||
        ""
      ).toLowerCase();

      const emailId = (
        doc?.emailId ||
        doc?.personalDetails?.emailId ||
        doc?.docRefId?.emailId ||
        ""
      ).toLowerCase();

      const mobileNumber = (
        doc?.mobileNumber ||
        doc?.personalDetails?.mobileNumber ||
        doc?.docRefId?.mobileNumber ||
        ""
      ).toLowerCase();

      const doctorId = (
        doc?.doctorId ||
        doc?.personalDetails?.doctorId ||
        doc?.docRefId?.doctorId ||
        ""
      ).toLowerCase();

      const hprId = (
        doc?.hprId ||
        doc?.hprRegistrationNumber ||
        doc?.personalDetails?.hprId ||
        doc?.personalDetails?.hprRegistrationNumber ||
        doc?.docRefId?.hprId ||
        doc?.docRefId?.hprRegistrationNumber ||
        ""
      ).toLowerCase();

      if (
        fullName.includes(query) ||
        emailId.includes(query) ||
        mobileNumber.includes(query) ||
        doctorId.includes(query) ||
        hprId.includes(query)
      ) {
        // Get display name from any available location
        const displayName =
          doc?.fullName ||
          doc?.personalDetails?.fullName ||
          doc?.docRefId?.fullName ||
          "Unknown Doctor";

        // Get identifier from any available location
        const identifier =
          doc?.emailId ||
          doc?.personalDetails?.emailId ||
          doc?.docRefId?.emailId ||
          doc?.mobileNumber ||
          doc?.personalDetails?.mobileNumber ||
          doc?.docRefId?.mobileNumber ||
          doc?.doctorId ||
          doc?.personalDetails?.doctorId ||
          doc?.docRefId?.doctorId ||
          doc?.hprId ||
          doc?.hprRegistrationNumber ||
          doc?.personalDetails?.hprId ||
          doc?.personalDetails?.hprRegistrationNumber ||
          doc?.docRefId?.hprId ||
          doc?.docRefId?.hprRegistrationNumber ||
          "";

        results.push({
          ...doc,
          type: "doctor",
          displayName: displayName,
          identifier: identifier,
        });
      }
    });

    setFilteredResults(results);

    // Show dropdown if there are results, hide if no results
    if (results.length > 0) {
      setShowDropdown(true);
    } else if (searchQuery.trim()) {
      setShowDropdown(true); // Show "no results" message
    } else {
      setShowDropdown(false);
    }
  }, [searchQuery, patients, doctors]);

  // Reset modal state when closed
  const handleCloseModal = () => {
    setIsInviteModalOpen(false);
    setSearchQuery("");
    setSelectedRecipient(null);
    setEmailChecked(false);
    setSmsChecked(false);
    setFilteredResults([]);
    setShowDropdown(false);
  };

  // Initialize/create a chat with a doctor
  // IMPORTANT: Use docRefId (doctor document ID) for chat initialization, not _id
  const initializeChatWithDoctor = async (
    doctorId,
    doctorName,
    doctorImage
  ) => {
    try {
      // Call backend to create/initialize chat
      // Use docRefId (doctor document ID) for senderId - this is required for chat initialization
      const senderDoctorId = doctor?._id?.toString();

      if (!senderDoctorId) {
        toast.error("Cannot initialize chat. Please try again.");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/user/chat/initialize`,
        {
          senderId: senderDoctorId, // Use docRefId (doctor document ID) for chat initialization
          receiverId: doctorId,
          receiverType: "doctor", // or "patient" depending on the recipient
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Refresh the chat list from backend immediately
        // The Chat model now ensures the doctor appears in the list
        const fetchChatList = async () => {
          try {
            // IMPORTANT: Always use _id (profile ID) for userId, never docRefId
            const userId = doctor._id?.toString();

            if (!userId) {
              return;
            }

            const res = await axios.post(
              `${process.env.REACT_APP_SERVER_BASE_URL}/user/getAll`,
              {
                userId: userId, // Uses _id (profile ID)
              }
            );

            if (res.data.success) {
              // Map the response from Chat model
              const mapped = res.data.usersWithLastMessage.map(
                (item, index) => ({
                  id: index + 1,
                  userId: item.userId,
                  sender: item.userName || "Unknown",
                  text: item.lastMessage || "", // Can be empty for new chats
                  image: item.userImage || "/default-user.png", // Backend returns userImage
                  timestamp: item.timestamp || new Date().toISOString(),
                  unreadCount: item.unreadCount || 0,
                })
              );

              setMsgs(mapped);
            }
          } catch (error) {
            // Error fetching chat list - silently fail
          }
        };

        // Fetch chat list immediately - Chat model ensures doctor appears
        await fetchChatList();

        // Start chat with the doctor
        props.onSelectReceiver(doctorId);
        props.setPatientName(doctorName);
        props.setSelectedContactImage?.(doctorImage);

        return true;
      } else {
        toast.error(response.data.message || "Failed to initialize chat");
        return false;
      }
    } catch (error) {
      // Even if initialization fails, still try to start the chat
      // Add doctor to local list and start chat
      const newChatEntry = {
        id: Date.now(),
        userId: doctorId,
        sender: doctorName,
        text: "",
        image: doctorImage || "/default-user.png",
        timestamp: new Date().toISOString(),
      };

      setMsgs((prevMsgs) => {
        const exists = prevMsgs.some(
          (msg) => msg.userId && msg.userId.toString() === doctorId.toString()
        );
        return exists ? prevMsgs : [newChatEntry, ...prevMsgs];
      });

      props.onSelectReceiver(doctorId);
      props.setPatientName(doctorName);
      props.setSelectedContactImage?.(doctorImage);
      return false;
    }
  };

  // Handle sending invite
  const handleSendInvite = async () => {
    if (!selectedRecipient) {
      toast.error("Please select a recipient");
      return;
    }

    if (!emailChecked && !smsChecked) {
      toast.error("Please select at least one channel (Email or SMS)");
      return;
    }

    setSendingInvite(true);
    try {
      // Get sender name from doctor object (handle nested structures)
      const senderName =
        doctor?.fullName ||
        doctor?.personalDetails?.fullName ||
        doctor?.docRefId?.fullName ||
        "Doctor";

      const basePayload = {
        recipientId: selectedRecipient._id || selectedRecipient.id,
        recipientType: selectedRecipient.type, // "patient" or "doctor"
        recipientEmail:
          selectedRecipient?.docRefId?.emailId ||
          selectedRecipient?.email ||
          "",
        recipientPhone:
          selectedRecipient?.docRefId?.mobileNumber ||
          selectedRecipient?.phone ||
          "",
        recipientName: selectedRecipient.displayName,
        senderName: senderName,
        senderId: doctor?._id || doctor?.id || "",
        hprId:
          selectedRecipient.hprId ||
          selectedRecipient.hprRegistrationNumber ||
          "",
        uhiId: selectedRecipient.uhiId || selectedRecipient.healthId || "",
      };

      const axiosConfig = {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      };

      // Array to store promises for both endpoints
      const requests = [];

      // Send email invitation if email is checked
      if (emailChecked) {
        requests.push(
          axios
            .post(
              `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/send-chat-invitation/email`,
              basePayload,
              axiosConfig
            )
            .then((response) => ({ type: "email", response }))
            .catch((error) => ({ type: "email", error }))
        );
      }

      // Send SMS invitation if SMS is checked
      if (smsChecked) {
        requests.push(
          axios
            .post(
              `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/send-chat-invitation/sms`,
              basePayload,
              axiosConfig
            )
            .then((response) => ({ type: "sms", response }))
            .catch((error) => ({ type: "sms", error }))
        );
      }

      // Wait for all requests to complete
      const results = await Promise.all(requests);

      // Check results and show appropriate messages
      const emailResult = results.find((r) => r.type === "email");
      const smsResult = results.find((r) => r.type === "sms");

      let successMessages = [];
      let errorMessages = [];

      if (emailResult) {
        if (emailResult.response?.data?.success) {
          successMessages.push("Email invitation sent successfully!");
        } else {
          errorMessages.push(
            emailResult.error?.response?.data?.message ||
              emailResult.response?.data?.message ||
              "Failed to send email invitation"
          );
        }
      }

      if (smsResult) {
        if (smsResult.response?.data?.success) {
          successMessages.push("SMS invitation sent successfully!");
        } else {
          errorMessages.push(
            smsResult.error?.response?.data?.message ||
              smsResult.response?.data?.message ||
              "Failed to send SMS invitation"
          );
        }
      }

      // Show success/error messages
      if (successMessages.length > 0) {
        successMessages.forEach((msg) => toast.success(msg));
      }
      if (errorMessages.length > 0) {
        errorMessages.forEach((msg) => toast.error(msg));
      }

      // Close modal only if at least one channel succeeded
      if (successMessages.length > 0) {
        handleCloseModal();
      } else if (errorMessages.length > 0) {
        // Don't close modal if all failed, so user can retry
        toast.error("Failed to send invitations. Please try again.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to send invite. Please try again."
      );
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div
      className={`${
        props.showList === false ? "w-0" : "w-full md:w-[26%]"
      } flex flex-col items-center overflow-hidden chat-sidebar rounded-l-xl`}
      style={{ minHeight: "calc(100vh - 110px)" }}
    >
      {/* added 'h-full' and 'overflow-y-auto' */}
      <div className='mt-2 flex h-[70px] w-full flex-row items-center justify-between bg-white pl-2 pr-2'>
        {props.showList && (
          <div
            className={`ml-1 mt-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full ${!props.showAddList ? "bg-gray-300" : ""}`}
            onClick={props.notebookClick}
          >
            <MdListAlt
              className={`h-[30px] w-[30px] cursor-pointer items-start rounded-full ${!props.showAddList ? "bg-gray-300" : ""} text-black`}
            />
          </div>
        )}

        {props.showList && (
          <div
            onClick={props.handleAddChat}
            className={`mb-2 mr-1 mt-4 flex h-11 w-11 items-center justify-center rounded-full ${props.showAddList ? "bg-gray-300" : ""} cursor-pointer`}
          >
            <svg
              width='32'
              height='32'
              viewBox='0 0 35 37'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M19.0909 5.3V8.5H3.18182V29.916L5.98659 27.7H28.6364V16.5H31.8182V29.3C31.8182 29.7243 31.6506 30.1313 31.3522 30.4314C31.0539 30.7314 30.6492 30.9 30.2273 30.9H7.0875L0 36.5V6.9C0 6.47565 0.167613 6.06869 0.465966 5.76863C0.76432 5.46857 1.16897 5.3 1.59091 5.3H19.0909ZM27.0455 5.3V0.5H30.2273V5.3H35V8.5H30.2273V13.3H27.0455V8.5H22.2727V5.3H27.0455Z'
                fill='#3E3E3E'
              />
            </svg>
          </div>
        )}
      </div>

      <div
        className={`flex w-full flex-col items-center overflow-y-auto bg-white`}
        style={{ overflow: "scroll", scrollbarWidth: "none" }}
      >
        <div className='mt-2 flex h-[45px] w-[95%] flex-row items-center justify-center rounded-[5px] border p-1'>
          <img
            src={require("../../Assets/images/search.png")}
            className='ml-2 mr-2 h-[16px] w-[16px] text-[#CDCED0]'
          />
          <input
            className='mb-1.5 w-full border-none text-start text-[14px]'
            type='text'
            placeholder='Search'
          />
        </div>
        {/* Chat Bot Option */}
        <div
          className='mt-2 flex h-[56px] w-full cursor-pointer items-center justify-start rounded-md px-3 hover:bg-gray-100'
          onClick={() => {
            setIsChatBotSelected(true);
            props.onSelectReceiver("chatbot");
            props.setPatientName("Dr. Jii: Ai Assistant");
            props.setSelectedContactImage?.(null);
          }}
        >
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#63636340]'>
            <RiRobot2Line className='h-6 w-6 text-[#636363]' />
          </div>
          <span className='ml-3 text-sm font-medium'>
            Dr. Jii: Ai Assistant
          </span>
        </div>
        {/* Temporary */}
        {props.showAddList ? (
          <div className='flex w-full flex-col items-start space-y-2'>
            <div
              onClick={props.handleAddChat}
              className='mt-2 flex cursor-pointer items-center justify-start px-3'
            >
              <GoArrowLeft className='h-8 w-6 text-[#636363]' />
            </div>
            <div className='flex h-[56px] cursor-pointer items-center justify-start rounded-md px-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#63636340]'>
                <MdGroupAdd className='h-6 w-6 text-[#636363]' />
              </div>
              <span className='ml-3 text-sm font-medium'>New space</span>
            </div>

            <div className='flex h-[56px] cursor-pointer items-center justify-start rounded-md px-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#63636340]'>
                <LuMessageSquarePlus className='h-6 w-6 text-[#636363]' />
              </div>
              <span className='ml-3 text-sm font-medium'>Message request</span>
            </div>

            <div
              className='flex h-[56px] cursor-pointer items-center justify-start rounded-md px-3'
              onClick={() => setIsInviteModalOpen(true)}
            >
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#63636340]'>
                <AiOutlineUserAdd className='h-6 w-6 text-[#636363]' />
              </div>
              <span className='ml-3 text-sm font-medium'>Invite to chat</span>
            </div>

            {/* <div> */}
            {/* did not remove this frequent chat option as it is empty Temporary */}
            {/* <span className='h-3 w-16 px-3 text-xs font-normal text-[#636363]'>
                Frequent
              </span> */}
            {/* {msgsFrequentChat.map((item) => (
                <div
                  key={item.id}
                  className='flex w-full flex-row items-start justify-between p-4'
                >
                  <img
                    src={item?.image}
                    className='mr-6 h-[40px] w-[40px] rounded-full'
                  />
                  <div className='ml-0 flex w-[65%] flex-col items-start'>
                    <span className='text-[16px] text-[Gilroy-SemiBold] text-[black]'>
                      {item.sender}
                    </span>
                    <span className='text-[12px] text-[#717171] text-[Gilroy-Medium]'>
                      {item.email}
                    </span>
                  </div>
                </div>
              ))} */}
            {/* </div> */}
          </div>
        ) : (
          <>
            {msgs.map((item) => (
              <div
                key={item.userId}
                onClick={() => {
                  setIsChatBotSelected(false);
                  props.onSelectReceiver(item.userId);
                  props.setPatientName(item.sender);
                  props.setSelectedContactImage?.(item.image);
                }} // Handle selection
                className={`flex w-full cursor-pointer flex-row items-start justify-between p-4 hover:bg-gray-100 ${
                  props.selectedReceiverId?.toString() ===
                  item.userId?.toString()
                    ? "bg-gray-100"
                    : ""
                }`}
              >
                <img
                  src={item?.image}
                  className='h-[40px] w-[40px] rounded-full'
                />
                <div className='ml-0 flex w-[65%] flex-col items-start'>
                  <span className='text-[16px] text-[Gilroy-SemiBold] text-[black]'>
                    {item.sender}
                  </span>
                  <span className='text-[12px] text-[#717171] text-[Gilroy-Medium]'>
                    {item.text || "No messages yet"}
                  </span>
                </div>
                <span className='text-[12px] text-[#717171] text-[Gilroy-Medium]'>
                  {item.timestamp
                    ? new Date(item.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        closeModal={handleCloseModal}
        title='Invite professional or patient'
        width='max-w-4xl'
      >
        <div className='min-h-[500px] space-y-4'>
          {/* Instructions */}
          <p className='text-sm text-blue-600'>
            Via mail address, mobile number and professional id(HPR ID) or
            patient health id(UHI ID)
          </p>

          {/* Search Input */}
          <div className='relative'>
            <div className='flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2'>
              <img
                src={require("../../Assets/images/search.png")}
                className='mr-2 h-4 w-4 text-gray-400'
                alt='search'
              />
              <input
                type='text'
                placeholder='Enter Mail ID, No. & HPR or UHI ID'
                className='w-full border-none text-sm text-gray-600 outline-none placeholder:text-sm placeholder:text-gray-400'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  if (searchQuery && filteredResults.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                onBlur={() => {
                  // Delay closing to allow click events to fire
                  setTimeout(() => setShowDropdown(false), 200);
                }}
              />
            </div>

            {/* Search Results Dropdown */}
            {showDropdown && searchQuery && filteredResults.length > 0 && (
              <div className='invite-dropdown-scroll absolute z-10 mt-1 max-h-96 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg'>
                {filteredResults.map((result, idx) => {
                  // Get unique identifier for comparison
                  const resultId = result._id || result.id;
                  const selectedId =
                    selectedRecipient?._id || selectedRecipient?.id;
                  const isSelected =
                    selectedRecipient &&
                    resultId &&
                    selectedId &&
                    String(resultId) === String(selectedId);

                  return (
                    <div
                      key={idx}
                      className={`flex cursor-pointer flex-row items-center gap-3 px-4 py-3 hover:bg-gray-100 ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                      onMouseDown={async (e) => {
                        e.preventDefault(); // Prevent input blur from firing first

                        // If it's a doctor (registered in DB), directly start chat
                        if (result.type === "doctor") {
                          const doctorId = result._id || result.id;
                          const doctorName = result.displayName || "Doctor";
                          const doctorImage =
                            result?.image ||
                            result?.doctorImage ||
                            result?.docRefId?.doctorImage ||
                            "/default-user.png";

                          // Initialize chat and add to chat list
                          const success = await initializeChatWithDoctor(
                            doctorId,
                            doctorName,
                            doctorImage
                          );

                          // Close the modal and reset state
                          handleCloseModal();

                          if (success) {
                            toast.success(`Chat started with ${doctorName}`);
                          }
                        } else {
                          // If it's a patient, show invitation flow
                          setSelectedRecipient(result);
                          setShowDropdown(false);
                          setSearchQuery(""); // Clear search to show selected recipient
                        }
                      }}
                    >
                      <img
                        src={
                          result?.image ||
                          result?.doctorImage ||
                          result?.docRefId?.doctorImage ||
                          "/default-user.png"
                        }
                        alt={result.displayName}
                        className='h-10 w-10 rounded-full border border-gray-300 object-cover'
                      />
                      <div className='flex flex-1 flex-col'>
                        <h2 className='text-sm font-semibold'>
                          {result.displayName}
                        </h2>
                        <p className='text-xs text-gray-500'>
                          {result.type === "doctor" ? "Doctor" : "Patient"}
                        </p>
                        <p className='text-xs text-gray-400'>
                          {result.identifier}
                        </p>
                      </div>
                      {isSelected && (
                        <div className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-600'>
                          <span className='text-xs text-white'>✓</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* No results message */}
            {showDropdown && searchQuery && filteredResults.length === 0 && (
              <div className='absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white p-4 shadow-lg'>
                <p className='text-center text-sm text-gray-500'>
                  No results found
                </p>
              </div>
            )}
          </div>

          {/* Selected Recipient Display */}
          {selectedRecipient && (
            <div className='rounded-lg border border-gray-200 bg-gray-50 p-3'>
              <div className='flex items-center gap-3'>
                <img
                  src={
                    selectedRecipient?.image ||
                    selectedRecipient?.docRefId?.doctorImage ||
                    "/default-user.png"
                  }
                  alt={selectedRecipient.displayName}
                  className='h-10 w-10 rounded-full border border-gray-300 object-cover'
                />
                <div className='flex flex-1 flex-col'>
                  <h3 className='text-sm font-semibold'>
                    {selectedRecipient.displayName}
                  </h3>
                  <p className='text-xs text-gray-500'>
                    {selectedRecipient.type === "doctor" ? "Doctor" : "Patient"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Channel Selection */}
          <div className='space-y-3 pt-2'>
            <p className='text-sm font-medium text-gray-700'>
              Select channels:
            </p>
            <div className='flex flex-row gap-6'>
              <label className='flex cursor-pointer items-center'>
                <input
                  type='checkbox'
                  checked={emailChecked}
                  onChange={(e) => setEmailChecked(e.target.checked)}
                  className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <span className='ml-2 text-sm text-gray-700'>Email</span>
              </label>
              <label className='flex cursor-pointer items-center'>
                <input
                  type='checkbox'
                  checked={smsChecked}
                  onChange={(e) => setSmsChecked(e.target.checked)}
                  className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <span className='ml-2 text-sm text-gray-700'>SMS</span>
              </label>
            </div>
          </div>

          {/* Send Invite Button */}
          <div className='flex justify-end pt-4'>
            <button
              onClick={handleSendInvite}
              disabled={
                !selectedRecipient ||
                (!emailChecked && !smsChecked) ||
                sendingInvite
              }
              className={`rounded-lg px-6 py-2 font-medium text-white ${
                !selectedRecipient ||
                (!emailChecked && !smsChecked) ||
                sendingInvite
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {sendingInvite ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const Chats = (props) => {
  const [profileId, setProfileId] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileInfo, setSelectedFileInfo] = useState(null); // Store file metadata (name, type, size)

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [lastFetchedMessageId, setLastFetchedMessageId] = useState(null);
  const [isChatBot, setIsChatBot] = useState(false);
  const [botTyping, setBotTyping] = useState(false);

  const textInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const topRef = useRef(null);
  const messageContainerRef = useRef(null);
  const messageRefs = useRef({});

  // Refs to access latest props
  const selectedReceiverIdRef = useRef(props.selectedReceiverId);
  const patientNameRef = useRef(props.patientName);
  const doctorRef = useRef(null);

  // Track received message IDs to prevent duplicates (as per backend suggestion)
  const receivedMessageIdsRef = useRef(new Set());
  // Track if we're currently sending a message to prevent fetchMessages interference
  const isSendingMessageRef = useRef(false);

  const { doctor } = useDoctorAuthStore();

  // Update refs when props change
  useEffect(() => {
    selectedReceiverIdRef.current = props.selectedReceiverId;
    patientNameRef.current = props.patientName;
  }, [props.selectedReceiverId, props.patientName]);

  useEffect(() => {
    doctorRef.current = doctor;
  }, [doctor]);

  // Check if Chat Bot is selected
  useEffect(() => {
    const isBot = props.selectedReceiverId === "chatbot";
    setIsChatBot(isBot);

    if (isBot) {
      // Reset messages and show welcome message when switching to chatbot
      const welcomeMessage = {
        id: `welcome-${Date.now()}`,
        sender: "Dr. Jii: Ai Assistant",
        text: "Hello! I'm Dr. Jii: Ai Assistant. How can I assist you today? You can ask me about medical information, appointments, or general questions.",
        timestamp: new Date().toISOString(),
        image: null,
      };
      setMessages([welcomeMessage]);
    }
  }, [props.selectedReceiverId]);

  //Temporary
  //const profileIdRef = useRef("");

  // Register socket once when component mounts
  useEffect(() => {
    if (!doctor?._id) return;
    setProfileId(doctor._id);

    // Register user function - use profile ID (_id) for socket registration
    // IMPORTANT: Always use _id (profile ID) for socket registration, never docRefId
    // Backend looks up sockets using profile IDs, not doctor IDs
    const registerUser = () => {
      // Use profile ID (_id) for socket registration - this is the correct ID for socket operations
      const profileId = doctor._id?.toString();

      if (!profileId) {
        return;
      }

      if (socket.connected) {
        socket.emit("registerUser", profileId);
      }
    };

    // Register user when socket connects (handles both initial connection and reconnection)
    const handleSocketConnect = () => {
      registerUser();
    };

    // Set up connection listener (will fire when socket connects)
    socket.on("connect", handleSocketConnect);

    // If already connected, register immediately
    if (socket.connected) {
      registerUser();
    } else {
      // Socket.IO should auto-connect, but if it's disconnected, try to connect
      if (socket.disconnected) {
        socket.connect();
      }
    }

    // Listen for incoming messages (as per backend guide)
    const handleReceiveMessage = (messageData) => {
      const currentReceiverId = selectedReceiverIdRef.current;
      const currentPatientName = patientNameRef.current;
      const currentDoctor = doctorRef.current;

      // Skip if chatbot conversation
      if (currentReceiverId === "chatbot") {
        return;
      }

      if (!currentDoctor?._id) {
        return;
      }

      // Extract message data (matching actual backend structure)
      // Backend sends: { senderProfileId, message, image, timestamp } or { senderId, receiverId, message, image, timestamp }
      const senderId = (
        messageData.senderProfileId ||
        messageData.senderId ||
        messageData.sender
      )?.toString();
      const receiverId = (
        messageData.receiverProfileId ||
        messageData.receiverId ||
        messageData.receiver
      )?.toString();
      const messageText =
        messageData.message || messageData.text || messageData.content || "";
      const messageImage = messageData.image || messageData.imageUrl || null;
      const messageId =
        messageData.messageId || messageData._id || messageData.id;

      // Validate: must have senderId and either messageText or image
      if (!senderId || (!messageText && !messageImage)) {
        return; // Invalid message data
      }

      const currentUserIdStr = currentDoctor._id.toString(); // Profile ID
      const currentReceiverIdStr = currentReceiverId?.toString();

      // Since backend only emits to receiver, if we receive it, we are the receiver
      // receiverId = currentUserIdStr (we are receiving it)
      const actualReceiverId = receiverId || currentUserIdStr;

      // Generate messageId if not provided
      const actualMessageId =
        messageId ||
        `${Date.now()}-${senderId}-${Math.random().toString(36).substr(2, 9)}`;

      // Prevent duplicate messages using messageId
      if (receivedMessageIdsRef.current.has(actualMessageId)) {
        return; // Skip if already received
      }

      // Since backend only emits to receiver, if we receive it, it's for us
      // No need to check isMessageForCurrentUser - we're the receiver

      // Don't add messages we sent ourselves (they're already added optimistically)
      const isMine = senderId === currentUserIdStr;
      if (isMine) {
        return; // Skip our own messages
      }

      // Check if we're currently viewing this chat
      // When receiver sends to sender:
      // - senderId = receiver's profile ID (the person we're chatting with)
      // - actualReceiverId = sender's profile ID (current user's profile ID)
      // - currentReceiverIdStr = receiver's profile ID (the person we're chatting with)
      // So: currentReceiverIdStr === senderId should be true
      const isCurrentChat =
        currentReceiverIdStr && currentReceiverIdStr === senderId;

      if (!isCurrentChat) {
        // Message is for us but not from currently selected chat
        return;
      }

      // Determine file type from URL if not provided
      // Check both top-level fields and imageMetadata object (for backward compatibility)
      let detectedFileType =
        messageData.fileType || messageData.imageMetadata?.fileType;
      if (!detectedFileType && messageImage) {
        const urlLower = messageImage.toLowerCase();
        if (urlLower.includes(".pdf") || urlLower.endsWith(".pdf")) {
          detectedFileType = "application/pdf";
        } else if (urlLower.includes(".png") || urlLower.endsWith(".png")) {
          detectedFileType = "image/png";
        } else if (
          urlLower.includes(".jpg") ||
          urlLower.includes(".jpeg") ||
          urlLower.endsWith(".jpg") ||
          urlLower.endsWith(".jpeg")
        ) {
          detectedFileType = "image/jpeg";
        } else if (urlLower.includes(".gif") || urlLower.endsWith(".gif")) {
          detectedFileType = "image/gif";
        } else if (urlLower.includes(".webp") || urlLower.endsWith(".webp")) {
          detectedFileType = "image/webp";
        } else {
          // Default to image/jpeg for image URLs
          detectedFileType = "image/jpeg";
        }
      }

      // Extract file metadata (check both top-level and imageMetadata for backward compatibility)
      const extractedFileName =
        messageData.fileName || messageData.imageMetadata?.originalFileName;
      const extractedFileSize =
        messageData.fileSize || messageData.imageMetadata?.fileSize;

      // Add message to current chat view immediately (as per backend guide)
      const message = {
        id: actualMessageId,
        sender: currentPatientName,
        text: messageText || "", // Allow empty text for image-only messages
        timestamp:
          messageData.timestamp ||
          messageData.createdAt ||
          new Date().toISOString(),
        image: messageImage || messageData.imageUrl || null,
        file: messageImage || messageData.imageUrl || messageData.file || null,
        fileType: detectedFileType,
        fileName:
          extractedFileName ||
          (detectedFileType === "application/pdf" ? "Document.pdf" : null),
        fileSize: extractedFileSize || null,
        seen: messageData.seen || false, // Message seen status
        senderId: senderId, // Store senderId to check if message is sent by current user
      };

      // Mark message as received to prevent duplicates
      receivedMessageIdsRef.current.add(actualMessageId);

      // Add message to state (as per backend guide)
      setMessages((prevMessages) => {
        // Double-check for duplicates
        const exists = prevMessages.some((msg) => msg.id === message.id);
        if (exists) {
          return prevMessages;
        }

        return [...prevMessages, message];
      });
    };

    // Listen for receiveMessage event (as per backend guide)
    socket.on("receiveMessage", (data) => {
      handleReceiveMessage(data);
    });

    // Also listen for connection status (as per backend suggestion)
    // Connection handler is already set up above, but we also need it in the cleanup section
    // The handleSocketConnect above will handle both initial and reconnection

    socket.on("disconnect", () => {
      // Socket disconnected - will auto-reconnect
    });

    socket.on("reconnect", () => {
      // Re-register user after reconnection (as per backend guide)
      // IMPORTANT: Always use _id (profile ID) for socket registration, never docRefId
      // Backend uses profile IDs for socket lookup
      const profileId = doctor._id?.toString();

      if (!profileId) {
        return;
      }

      socket.emit("registerUser", profileId);
    });

    socket.on("connect_error", (error) => {
      // Try to reconnect with polling if websocket fails
      if (error.type === "TransportError") {
        socket.io.opts.transports = ["polling"];
        socket.disconnect();
        setTimeout(() => {
          socket.connect();
        }, 1000);
      }
    });

    // Listen for messageSeen event (when receiver marks message as seen)
    const handleMessageSeen = (data) => {
      const { messageId, receiverId, seenAt } = data;

      if (!messageId) {
        return;
      }

      // Convert messageId to string for comparison (handles both string and ObjectId)
      const messageIdStr = messageId.toString();

      // Update the message's seen status in the UI
      setMessages((prevMessages) => {
        const updated = prevMessages.map((msg) => {
          // Convert msg.id to string for comparison
          const msgIdStr = msg.id?.toString();

          // Check direct match
          if (msgIdStr === messageIdStr) {
            return { ...msg, seen: true };
          }

          return msg;
        });

        return updated;
      });
    };

    socket.on("messageSeen", handleMessageSeen);

    // Cleanup
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("connect", handleSocketConnect);
      socket.off("disconnect");
      socket.off("reconnect");
      socket.off("connect_error");
      socket.off("messageSeen", handleMessageSeen);
    };
  }, [doctor?._id]);

  // Function to mark a message as seen
  const markMessageAsSeen = async (messageId) => {
    if (!messageId || !profileId) return;

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_SERVER_BASE_URL}/user/message/${messageId}/seen`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Update local state - the socket event will also update it, but this ensures immediate update
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, seen: true } : msg
          )
        );
      }
    } catch (error) {
      // Don't show error to user - this is a background operation
    }
  };

  // Track which messages have been marked as seen to avoid duplicate API calls
  const markedAsSeenRef = useRef(new Set());

  // Intersection Observer to detect when messages are visible
  useEffect(() => {
    if (!messageContainerRef.current || props.selectedReceiverId === "chatbot")
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute("data-message-id");
            const messageSenderId = entry.target.getAttribute("data-sender-id");
            const isSeen = entry.target.getAttribute("data-seen") === "true";

            // Only mark as seen if:
            // 1. Message is not sent by current user (we only mark received messages as seen)
            // 2. Message hasn't been seen yet
            // 3. Message hasn't been marked as seen already
            if (
              messageId &&
              messageSenderId !== profileId &&
              !isSeen &&
              !markedAsSeenRef.current.has(messageId)
            ) {
              markedAsSeenRef.current.add(messageId);
              markMessageAsSeen(messageId);
            }
          }
        });
      },
      {
        root: messageContainerRef.current,
        rootMargin: "0px",
        threshold: 0.5, // Message is considered visible when 50% is in view
      }
    );

    // Observe all message elements
    Object.values(messageRefs.current).forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [messages, profileId, props.selectedReceiverId]);

  // Get Chat Bot response
  const getBotResponse = async (userMessage) => {
    setBotTyping(true);

    try {
      // Call backend API for bot response
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/chatbot/message`,
        {
          message: userMessage,
          userId: doctor?._id,
          context: "medical_assistant",
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Simulate typing delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (response.data && response.data.response) {
        return response.data.response;
      } else {
        return "I'm sorry, I didn't understand that. Could you please rephrase your question?";
      }
    } catch (error) {
      // Fallback response if API fails
      return "I'm having trouble processing your request right now. Please try again in a moment.";
    } finally {
      setBotTyping(false);
    }
  };

  // Download handler - Cloudinary URLs only
  const handleDownload = (url, filename, fileType = null) => {
    // Validate URL - only allow Cloudinary URLs
    if (!url || !url.includes("cloudinary.com")) {
      toast.error("Invalid file source. Only Cloudinary URLs are allowed.");
      return;
    }

    // For Cloudinary URLs, add fl_attachment parameter to force download
    let downloadUrl = url;
    if (url.includes("/upload/")) {
      const parts = url.split("/upload/");
      if (parts.length === 2) {
        // Add fl_attachment transformation to force download
        downloadUrl = `${parts[0]}/upload/fl_attachment/${parts[1]}`;
      }
    }

    // Create direct download link using Cloudinary URL
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "attachment";
    link.target = "_blank"; // Open in new tab if download doesn't work
    link.rel = "noopener noreferrer";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // toast.success('Download started');
  };

  // Fetch paginated messages
  const fetchMessages = async (pageNumber = 1) => {
    const receiverId = props.selectedReceiverId;
    if (!profileId || !receiverId) return;

    // Don't fetch messages for chatbot
    if (receiverId === "chatbot") {
      return;
    }

    // Don't fetch if we're currently sending a message (to avoid race conditions)
    if (isSendingMessageRef.current && pageNumber === 1) {
      return;
    }

    try {
      setLoading(true);
      // IMPORTANT: Always use _id (profile ID) for senderId in API calls, never docRefId
      // profileId is set from doctor._id, which is the correct profile document ID
      const res = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/user/all/${receiverId}`,
        { senderId: profileId }, // body - uses _id (profile ID)
        {
          params: { page: pageNumber, limit: pageNumber === 1 ? 50 : 10 }, // Fetch 50 messages on first load, 10 for pagination
          withCredentials: true, // this is the axios equivalent of credentials: 'include'
          // headers: { Authorization: `Bearer ${token}` }, // include your JWT
        }
      );

      // Optimized file type detection function
      const detectFileType = (url) => {
        if (!url) return null;

        // Base64 data URL
        if (url.startsWith("data:")) {
          const matches = url.match(/^data:(.+);base64,/);
          return matches ? matches[1] : "image/jpeg";
        }

        // Check file extension (case-insensitive)
        const urlLower = url.toLowerCase();
        if (urlLower.includes(".pdf")) return "application/pdf";
        if (urlLower.includes(".png")) return "image/png";
        if (urlLower.includes(".jpg") || urlLower.includes(".jpeg"))
          return "image/jpeg";
        if (urlLower.includes(".gif")) return "image/gif";
        if (urlLower.includes(".webp")) return "image/webp";

        // Default for image URLs
        return "image/jpeg";
      };

      const fetchedMessages = res.data.messages.map((msg) => {
        const fileType = detectFileType(msg.image);

        return {
          id: msg._id,
          sender:
            msg.senderId === profileId ? doctor.fullName : props.patientName,
          text: msg.message || "", // Allow empty text for image-only messages
          image: msg.image || null,
          file: msg.image || null, // Use image as file for rendering
          fileType: fileType,
          fileName:
            msg.fileName ||
            (msg.image && fileType === "application/pdf"
              ? "Document.pdf"
              : null),
          fileSize: msg.fileSize || null,
          timestamp: msg.createdAt,
          seen: msg.seen || false, // Message seen status
          senderId: msg.senderId, // Store senderId to check if message is sent by current user
        };
      });

      if (fetchedMessages.length > 0) {
        const lastMessage = fetchedMessages[fetchedMessages.length - 1];
        setLastFetchedMessageId(lastMessage.id);
      }

      if (pageNumber === 1) {
        // When fetching page 1, replace all messages (typically when switching chats)
        // But merge with any socket-received messages that might be newer
        setMessages((prev) => {
          const fetchedIds = new Set(fetchedMessages.map((msg) => msg.id));
          // Keep any socket-received messages that aren't in the fetched list (newer messages)
          const socketMessages = prev.filter((msg) => !fetchedIds.has(msg.id));
          // Combine: fetched messages + any newer socket messages
          return [...fetchedMessages, ...socketMessages].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
        });
      } else {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((msg) => msg.id));
          const newMsgs = fetchedMessages.filter(
            (msg) => !existingIds.has(msg.id)
          );
          return [...newMsgs, ...prev];
        });
      }

      setHasMore(pageNumber < res.data.pagination.totalPages);
      setPage(pageNumber);
    } catch (err) {
      // Error fetching messages - silently fail
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) {
      return; // Still prevents sending truly empty messages
    }

    const timestamp = new Date().toISOString();
    // IMPORTANT: Always use _id (profile ID) for senderId, never docRefId
    // This ensures consistency with socket registration and chat initialization
    const senderId = doctor?._id;
    const receiverId = props.selectedReceiverId;

    if (!senderId || !receiverId) {
      toast.error(
        "Cannot send message. Missing sender or receiver information."
      );
      return;
    }

    const cleanedMessage = newMessage.trim();

    // Handle Chat Bot messages
    if (receiverId === "chatbot") {
      // Add user message
      const userMessage = {
        id: `user-${Date.now()}`,
        sender: doctor.fullName,
        text: cleanedMessage,
        image: selectedFile || null,
        file: selectedFile || null,
        fileType: selectedFileInfo?.type || null,
        fileName: selectedFileInfo?.name || null,
        fileSize: selectedFileInfo?.size || null,
        timestamp: timestamp,
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // Clear inputs immediately
      setNewMessage("");
      setSelectedFile(null);
      setSelectedFileInfo(null);

      // Get bot response
      const botResponse = await getBotResponse(cleanedMessage);

      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: "Dr. Jii: Ai Assistant",
        text: botResponse,
        timestamp: new Date().toISOString(),
        image: null,
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
      return;
    }

    // Regular chat messages
    const messageData = {
      senderProfileId: senderId,
      receiverProfileId: receiverId,
      message: cleanedMessage || "",
      image: selectedFile || null,
      timestamp: timestamp,
    };

    // Set flag to prevent fetchMessages from interfering
    isSendingMessageRef.current = true;

    // Clear inputs immediately for better UX
    const messageText = cleanedMessage;
    const messageImage = selectedFile;
    const messageFileInfo = selectedFileInfo;
    setNewMessage("");
    setSelectedFile(null);
    setSelectedFileInfo(null);

    // Save to backend (as per backend guide)
    // The backend will emit socket event automatically
    try {
      // Verify socket is connected and registered (as per backend guide)
      if (!socket.connected) {
        socket.connect();
        // Wait a bit for connection
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Re-register before sending (ensures user is in socket registry) - as per backend guide
      // IMPORTANT: Always use _id (profile ID) for socket registration, never docRefId
      // Backend uses profile IDs for socket lookup
      const profileId = doctor._id?.toString();

      if (!profileId) {
        toast.error("Cannot send message. Please refresh and try again.");
        return;
      }

      socket.emit("registerUser", profileId);

      // Send via REST API (as per backend guide)
      // IMPORTANT: Always use _id (profile document ID) for API calls, never docRefId
      // This matches chat initialization and ensures consistency
      const senderProfileId = doctor._id?.toString();

      // Check payload size before sending (base64 is ~33% larger than original)
      // Most servers have a default limit of 1-5MB for JSON payloads
      if (selectedFile) {
        const base64Size = selectedFile.length;
        const estimatedOriginalSize = Math.round((base64Size * 3) / 4); // Approximate original size
        const maxPayloadSize = 3 * 1024 * 1024; // 3MB limit (conservative for JSON payloads)

        if (estimatedOriginalSize > maxPayloadSize) {
          toast.error(
            "File is too large to send. Please use a smaller file (max 3MB)."
          );
          return;
        }
      }

      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/user/send/${receiverId}`,
        {
          senderId: senderProfileId, // Use profile ID for API (matches chat initialization)
          message: cleanedMessage,
          image: selectedFile || null,
          fileType: selectedFileInfo?.type || null,
          fileName: selectedFileInfo?.name || null,
          fileSize: selectedFileInfo?.size || null,
        },
        {
          withCredentials: true,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          // Note: Backend also needs to increase payload size limit
        }
      );

      // Backend returns: { success: true, newMessage: { ... } }
      const messageData = response.data?.newMessage || response.data?.message;

      if (messageData?._id) {
        const realMessageId = messageData._id.toString();

        // Add message to UI with real MongoDB ID from backend
        const newMessage = {
          id: realMessageId,
          sender: doctor.fullName,
          text: messageText,
          image: messageData.image || messageImage || null,
          file: messageData.image || messageImage || null,
          fileType: messageFileInfo?.type || null,
          fileName: messageData.fileName || messageFileInfo?.name || null,
          fileSize: messageData.fileSize || messageFileInfo?.size || null,
          timestamp: messageData.createdAt || timestamp,
          seen: messageData.seen || false,
          senderId: messageData.senderId || senderId,
        };

        setMessages((prevMessages) => {
          // Check if message already exists (in case socket event arrived first)
          const exists = prevMessages.some((msg) => msg.id === realMessageId);
          if (exists) {
            return prevMessages;
          }
          return [...prevMessages, newMessage];
        });
      } else {
        toast.error("Failed to send message. Please try again.");
      }

      // Don't call fetchMessages here - rely on socket events for real-time updates
      // The backend will emit the message via socket, and our listener will handle it
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      // Clear the flag after a short delay to allow socket events to process
      setTimeout(() => {
        isSendingMessageRef.current = false;
      }, 1000);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const allowedPdfType = "application/pdf";
    const allowedTypes = [...allowedImageTypes, allowedPdfType];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        `File type not supported. Please select an image (JPG, PNG, GIF, WEBP) or PDF.`
      );
      event.target.value = ""; // Reset input
      return;
    }

    // Validate file size (conservative limits to avoid payload issues)
    // Base64 encoding increases size by ~33%, so we limit original files to stay under payload limits
    const maxPdfSize = 50 * 1024 * 1024; // 2MB for PDFs (becomes ~2.7MB base64)
    const maxImageSize = 50 * 1024 * 1024; // 3MB for images (will be compressed, but limit original)
    const isPdf = file.type === allowedPdfType;

    if (isPdf && file.size > maxPdfSize) {
      toast.error(`PDF file size too large. Maximum size is 50MB.`);
      event.target.value = ""; // Reset input
      return;
    }

    if (!isPdf && file.size > maxImageSize) {
      toast.error(`Image file size too large. Maximum size is 50MB.`);
      event.target.value = ""; // Reset input
      return;
    }

    // Store file metadata
    const fileInfo = {
      name: file.name,
      type: file.type,
      size: file.size,
      isImage: allowedImageTypes.includes(file.type),
      isPdf: isPdf,
    };
    setSelectedFileInfo(fileInfo);

    try {
      // Read file as base64 (no compression - backend handles large files)
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setSelectedFile(base64Data);

      // Scroll to bottom to show preview
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      toast.error("Error processing file. Please try again.");
      event.target.value = ""; // Reset input
      setSelectedFileInfo(null);
    }
  };

  // const loadOlderMessages = () => {
  //   if (!hasMore || loading) return;
  //   fetchMessages(page + 1);
  // };

  useEffect(() => {
    const handleScroll = () => {
      const container = messageContainerRef.current;
      if (!container || loading || !hasMore) return;

      if (container.scrollTop === 0) {
        const prevScrollHeight = container.scrollHeight;

        fetchMessages(page + 1).then(() => {
          // Maintain scroll position after older messages are prepended
          setTimeout(() => {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - prevScrollHeight;
          }, 100); // short delay to wait for render
        });
      }
    };

    const container = messageContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [page, loading, hasMore]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (lastFetchedMessageId && messageRefs.current[lastFetchedMessageId]) {
      messageRefs.current[lastFetchedMessageId].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [lastFetchedMessageId, messages]);

  useEffect(() => {
    if (profileId && props.selectedReceiverId) {
      // Don't fetch messages for chatbot - let the welcome message effect handle it
      if (props.selectedReceiverId === "chatbot") {
        setPage(1);
        setHasMore(false);
        return;
      }
      // Reset seen tracking when switching chats
      markedAsSeenRef.current.clear();
      setMessages([]);
      setPage(1);
      setHasMore(true);
      fetchMessages(1);
    }
  }, [profileId, props.selectedReceiverId]);

  return (
    <div className='container'>
      <div className='top-border'>
        <div className='flex flex-row items-center'>
          {props.showList === false && (
            <div onClick={props.notebookClick}>
              <MdListAlt className='h-[30px] w-[30px] cursor-pointer text-black' />
            </div>
          )}
          {isChatBot ? (
            <>
              <div className='ml-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100'>
                <RiRobot2Fill className='h-6 w-6 text-blue-600' />
              </div>
              <h6 className='pl-4 text-[20px] text-[Gilroy-SemiBold] text-[black]'>
                Dr. Jii: Ai Assistant
              </h6>
            </>
          ) : (
            <>
              <h6 className='pl-4 text-[20px] text-[Gilroy-SemiBold] text-[black]'>
                {props.patientName || "Chat"}
              </h6>
              <FaChevronDown className='ml-4 h-[16px] w-[16px]' />
            </>
          )}
        </div>
        {!isChatBot && props.selectedReceiverId && (
          <img
            src={props.selectedContactImage || "/default-user.png"}
            className='h-[40px] w-[40px] rounded-full'
            alt={props.patientName}
          />
        )}
      </div>
      <div className='message-container' ref={messageContainerRef}>
        {loading && (
          <div className='mt-2 text-center text-sm text-gray-500'>
            Loading...
          </div>
        )}

        <div ref={topRef}></div>

        {messages?.map((message, index) => {
          const isSentMessage = message.sender === doctor.fullName;
          const isBot = message.sender === "Dr. Jii: Ai Assistant";

          const currentDate = new Date(message.timestamp);
          const prevDate =
            index > 0 ? new Date(messages[index - 1].timestamp) : null;

          const isNewDay =
            !prevDate || currentDate.toDateString() !== prevDate.toDateString();

          const formatDate = (date) => {
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);

            if (date.toDateString() === today.toDateString()) {
              return "Today";
            } else if (date.toDateString() === yesterday.toDateString()) {
              return "Yesterday";
            } else {
              return date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
            }
          };

          return (
            <React.Fragment key={message.id}>
              {/* DATE SEPARATOR */}
              {isNewDay && (
                <div className='my-4 flex justify-center'>
                  <span className='rounded-full bg-gray-300 px-4 py-1 text-xs text-gray-700'>
                    {formatDate(currentDate)}
                  </span>
                </div>
              )}

              <div
                className={`message-group ${isSentMessage ? "sent" : "received"}`}
              >
                <div
                  ref={(el) => {
                    messageRefs.current[message.id] = el;
                  }}
                  data-message-id={message.id}
                  data-sender-id={
                    message.senderId || (isSentMessage ? profileId : null)
                  }
                  data-seen={message.seen ? "true" : "false"}
                  className={`message ${isSentMessage ? "sent-message" : "received-message"} ${isBot ? "bot-message" : ""}`}
                >
                  {!isSentMessage && (
                    <p className='message-sender'>
                      {isBot ? "Dr. Jii" : props.patientName}
                      {isBot && <span className='ai-badge'>AI Assistant</span>}
                    </p>
                  )}

                  {message.text && (
                    <p className='message-text'>{message.text}</p>
                  )}

                  {(message.image || message.file) && (
                    <div className='relative mt-2 inline-block'>
                      {message.image &&
                        (message.fileType?.startsWith("image/") ||
                          !message.fileType ||
                          message.fileType !== "application/pdf") && (
                          <>
                            <img
                              src={message.image}
                              alt='Sent'
                              className='uploaded-image'
                            />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                let extension = "jpg";
                                let mimeType = "image/jpeg";
                                if (message.fileType) {
                                  mimeType = message.fileType;
                                  extension =
                                    message.fileType.split("/")[1] || "jpg";
                                } else if (message.image) {
                                  const urlLower = message.image.toLowerCase();
                                  if (
                                    urlLower.includes(".png") ||
                                    urlLower.includes("/png")
                                  ) {
                                    extension = "png";
                                    mimeType = "image/png";
                                  } else if (
                                    urlLower.includes(".gif") ||
                                    urlLower.includes("/gif")
                                  ) {
                                    extension = "gif";
                                    mimeType = "image/gif";
                                  } else if (
                                    urlLower.includes(".webp") ||
                                    urlLower.includes("/webp")
                                  ) {
                                    extension = "webp";
                                    mimeType = "image/webp";
                                  }
                                }
                                handleDownload(
                                  message.image,
                                  `attachment-${message.id}.${extension}`,
                                  mimeType
                                );
                              }}
                              className='download-button absolute bottom-2 left-2'
                              title='Download image'
                            >
                              <LuArrowDownToLine className='h-4 w-4' />
                              Download
                            </button>
                          </>
                        )}

                      {message.fileType === "application/pdf" && (
                        <div className='pdf-preview'>
                          <div className='pdf-icon'>
                            <svg
                              className='h-full w-full text-red-600'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path
                                fillRule='evenodd'
                                d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </div>
                          <div className='pdf-info'>
                            <p className='pdf-name'>
                              {message.fileName || "Document.pdf"}
                            </p>
                            {message.fileSize && (
                              <p className='pdf-size'>
                                {(message.fileSize / 1024 / 1024).toFixed(2)} MB
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDownload(
                                message.image || message.file,
                                message.fileName ||
                                  `attachment-${message.id}.pdf`,
                                message.fileType || "application/pdf"
                              );
                            }}
                            className='download-button'
                            title='Download file'
                          >
                            <LuArrowDownToLine className='h-4 w-4' />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Timestamp and delivery status */}
                <div className='message-status'>
                  <span className='message-timestamp'>
                    {message.timestamp
                      ? new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>

                  {isSentMessage && (
                    <span
                      className={`status-icon status-${message.seen ? "seen" : "sent"}`}
                    >
                      {message.seen ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Bot Typing Indicator */}
        {botTyping && isChatBot && (
          <div className='message-group received'>
            <div className='message received-message bot-message'>
              <p className='message-sender'>Dr. Jii: Ai Assistant</p>
              <div className='typing-indicator'>
                <div className='typing-dot'></div>
                <div className='typing-dot'></div>
                <div className='typing-dot'></div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state when no messages */}
        {!loading && !isChatBot && messages.length === 0 && (
          <div className='flex h-full items-center justify-center'>
            <div className='text-center'>
              <p className='text-gray-500'>No messages yet</p>
              <p className='mt-2 text-sm text-gray-400'>
                Start a conversation with {props.patientName}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      {/* Input area - always at bottom, outside message container */}
      <div className='flex-shrink-0 bg-gradient-to-b from-transparent to-transparent px-4 pb-4'>
        {/* File Preview - Modern style with new CSS classes */}
        {selectedFile && selectedFileInfo && (
          <div className='file-preview-wrapper'>
            {selectedFileInfo.isImage && (
              <div className='image-preview'>
                <img src={selectedFile} alt='Preview' />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setSelectedFileInfo(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className='file-remove-btn'
                  title='Remove file'
                  type='button'
                >
                  ×
                </button>
              </div>
            )}

            {selectedFileInfo.isPdf && (
              <div className='pdf-preview'>
                <div className='pdf-icon'>
                  <svg
                    className='h-full w-full text-red-600'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='pdf-info'>
                  <p className='pdf-name'>{selectedFileInfo.name}</p>
                  <p className='pdf-size'>
                    {(selectedFileInfo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setSelectedFileInfo(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className='pdf-remove-btn'
                  title='Remove file'
                  type='button'
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modern input container with proper styling and hover effects */}
        <div className='input-container'>
          <button
            type='button'
            onClick={() => fileInputRef.current.click()}
            className='attachment-button'
            title='Attach file'
          >
            <BsPaperclip className='h-6 w-6' />
          </button>

          <input
            ref={textInputRef}
            className='input'
            placeholder='Type a message...'
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <input
            type='file'
            ref={fileInputRef}
            style={{ display: "none" }}
            accept='image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf'
            onChange={handleFileChange}
          />

          <button
            type='button'
            onClick={sendMessage}
            disabled={!newMessage.trim() && !selectedFile}
            className='send-button'
            title='Send message'
          >
            <BsArrowUpCircleFill className='h-5 w-5' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
