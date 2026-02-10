import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { BsArrowUpCircleFill, BsPaperclip } from "react-icons/bs";
import { FaChevronDown } from "react-icons/fa";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";
import React from "react";
import { LuArrowDownToLine } from "react-icons/lu";
import "../Chat/Chat.css";


export const PatientChat = (props) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const textInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { doctor } = useDoctorAuthStore();

  const patientId = props.id;
  const doctorId = doctor?._id;

  const [profileId, setProfileId] = useState(doctorId);
  
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
  
    const [lastFetchedMessageId, setLastFetchedMessageId] = useState(null);
  
    const topRef = useRef(null);
    const messageContainerRef = useRef(null);
    const messageRefs = useRef({});

  const fetchMessages = async (pageNumber = 1) => {
    const receiverId = patientId;
    if (!profileId || !receiverId) return;

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/user/all/${receiverId}?page=${pageNumber}&limit=10`,
        { senderId: profileId }
      );

      const fetchedMessages = res.data.messages.map((msg, index) => ({
        id: msg._id,
        sender:
          msg.senderId === profileId ? doctor.fullName : props.patientName,
        text: msg.message,
        image: msg.image,
        timestamp: msg.createdAt,
      }));
      console.log("fetchedMessages:",fetchedMessages);

      if (fetchedMessages.length > 0) {
        const lastMessage = fetchedMessages[fetchedMessages.length - 1];
        setLastFetchedMessageId(lastMessage.id);
      }

      if (pageNumber === 1) {
        setMessages(fetchedMessages);
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
      console.error("Error fetching messages", err);
    } finally {
      setLoading(false);
    }
  };

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

    useEffect(() => {
        if (profileId && patientId) {
          setMessages([]);
          setPage(1);
          setHasMore(true);
          fetchMessages(1);
        }
      }, [profileId,patientId]);

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) {
      return; // Still prevents sending truly empty messages
    }

    const timestamp = new Date().toISOString();

    const cleanedMessage = newMessage.trim();

    const messageData = {
      senderProfileId: doctorId,
      receiverProfileId: patientId,
      message: cleanedMessage || "",
      image: selectedFile || null,
      timestamp,
    };
    console.log("Data to be sent:",messageData);

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: prevMessages.length + 1,
        sender: doctor.fullName,
        text: cleanedMessage,
        image: selectedFile,
        timestamp,
      },
    ]);

    setNewMessage("");
    setSelectedFile(null);

    try {
      await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/user/send/${patientId}`, {
        senderId: doctorId,
        message: cleanedMessage || "",
        image: selectedFile || null,
      });
    } catch (err) {
      console.error("Error saving message:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sortedMessages = [...messages].sort(
  (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
);

  return (
    <div
      className='flex h-[800px] w-full flex-col overflow-hidden bg-[#DBD9D940]'
      style={{ scrollbarWidth: "none" }}
    >
      <div className='top-border'>
        <div className='flex flex-row items-center'>
          <h6 className='pl-4 text-[20px] text-[Gilroy-SemiBold] text-[black]'>
            {doctor.fullName}
          </h6>
          <FaChevronDown className='ml-4 h-[16px] w-[16px]' />
        </div>
        <img
          src={doctor.doctorImage}
          className='h-[40px] w-[40px] rounded-full'
        />
      </div>
      <div className='message-container' style={{ scrollbarWidth: "none" }}
      ref={messageContainerRef}>
        {sortedMessages.map((message, index) => {
  const currentDate = new Date(message.timestamp);
  const prevDate = index > 0 ? new Date(sortedMessages[index - 1].timestamp) : null;

  const isNewDay =
    !prevDate || currentDate.toDateString() !== prevDate.toDateString();

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <React.Fragment key={message.id}>
      {isNewDay && (
        <div className='my-4 flex justify-center'>
          <span className='rounded-full bg-gray-300 px-4 py-1 text-xs text-gray-700'>
            {formatDate(currentDate)}
          </span>
        </div>
      )}

      <div
        className={`message ${
          message.sender === doctor.fullName ? "sent-message" : "received-message"
        }`}
      >
        <p className='message-sender'>{message.sender}</p>
        <p className='message-text text-[14px] text-[Gilroy-Medium]'>
          {message.text}
        </p>
        {message.image && (
                          <div className='relative mt-2 inline-block'>
                            <img
                              src={message.image}
                              alt='Sent'
                              className='max-h-40 rounded-md'
                            />
                            <a
                              href={message.image}
                              download={`attachment-${message.id}`}
                              className='absolute bottom-1 left-1 rounded-full bg-white p-1 shadow-md transition-opacity duration-200'
                              title='Download image'
                            >
                              <LuArrowDownToLine className='h-5 w-5 text-black' />
                            </a>
                          </div>
                        )}
        <div className='flex w-full flex-row items-center justify-end'>
          <span className='mr-8 text-[10px]'>
            {message.timestamp &&
              new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
          </span>
        </div>
      </div>
    </React.Fragment>
  );
})}

        <div ref={messagesEndRef}></div>
      </div>
      <div className='rouned-full flex w-full flex-row items-center justify-center border'>
        {selectedFile && (
  <div className='relative mb-2 ml-4 mt-2 w-fit'>
    <img
      src={selectedFile}
      alt='Preview'
      className='max-h-40 rounded-md'
    />
    <button
      onClick={() => setSelectedFile(null)}
      className='absolute left-1 top-1 rounded-full bg-red-600 p-1 text-white hover:bg-red-700'
      style={{ fontSize: "12px", lineHeight: "12px" }}
      title="Remove file"
    >
      ✕
    </button>
  </div>
)}

        <div className='mb-8 flex w-[80%] flex-row items-center rounded-full bg-white p-2'>
          <div
            className='cursor-pointer'
            onClick={() => fileInputRef.current.click()}
          >
            <BsPaperclip className='h-[25px] w-[25px] text-black' />
            {/* <img src={image} height={30} width={30} onResize="contain"/> */}
          </div>
          <input
            ref={textInputRef}
            className='input'
            placeholder='Type a message...'
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <input
            type='file'
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <BsArrowUpCircleFill
            onClick={sendMessage}
            className='h-[25px] w-[25px] text-[#A3A3A3] cursor-pointer'
          />
          {/* <button className="send-button" onClick={sendMessage}>Send</button> */}
        </div>
      </div>
    </div>
  );
};
