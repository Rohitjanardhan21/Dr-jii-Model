import React, { useEffect, useRef, useState } from "react";
import Layout from "../Layout";
import { FaArrowLeft, FaChevronDown } from "react-icons/fa";
import { BsArrowUpCircleFill, BsPaperclip } from "react-icons/bs";
import { MdOutlinePhone } from "react-icons/md";
import { FiPhone } from "react-icons/fi";
import "./Chat/Chat.css";
import { IoCheckmarkDone, IoSendSharp } from "react-icons/io5";
import { BiPlusCircle } from "react-icons/bi";

export default function Support() {
  return (
    <Layout>
      <div>
        <Chats />
      </div>
    </Layout>
  );
}

const Chats = () => {
  const [messages, setMessages] = useState([]);

  const [newMessage, setNewMessage] = useState("");

  const textInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    // if (newMessage.trim() !== '') {
    //     const isLink = newMessage.match(/\bhttps?:\/\/\S+/gi);
    //     if (isLink) {
    //         try {
    //             const linkInfo = await getLinkPreview(isLink[0]);
    //             setMessages(prevMessages => [
    //                 ...prevMessages,
    //                 { id: prevMessages.length + 1, sender: 'You', text: newMessage, linkPreview: linkInfo },
    //             ]);
    //         } catch (error) {
    //             console.error('Error fetching link preview:', error);
    //         }
    //     } else {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: prevMessages.length + 1, sender: "You", text: newMessage },
    ]);
    // }

    setNewMessage("");
    // }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: prevMessages.length + 1, sender: "You", image: reader.result },
        ]);
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

  return (
    <div
      className='flex h-[85vh] w-full flex-col overflow-hidden bg-[white]'
      style={{ scrollbarWidth: "none" }}
    >
      <div className='flex w-full flex-row items-center justify-between border bg-[#0095D9] p-4'>
        <div className='flex flex-row items-center'>
          <FaArrowLeft className='ml-4 h-[16px] w-[18px] text-white' />
          <h6 className='pl-4 text-[20px] text-[Gilroy-SemiBold] text-[white]'>
            Dr. Jii
          </h6>
        </div>
        <FiPhone className='mr-4 h-[25px] w-[25px] text-white' />
      </div>
      <div
        className='message-container w-[90%] self-center'
        style={{ scrollbarWidth: "none" }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === "You" ? "w-[45%] self-end bg-[#0095D9]" : "w-[45%] self-start bg-[#F0EEEE]"}`}
          >
            {/* {message.image && (

                            <img src={message.image} alt="Uploaded" className="uploaded-image" />
                        )} */}
            <p className='message-sender'>{message.sender}</p>
            <p className='message-text text-[14px] text-[Gilroy-Medium]'>
              {message.text}
            </p>
            <div className='mr-6 flex w-full flex-row items-center justify-end'>
              <span
                className={`${message.sender === "You" ? "text-white" : "text-black"} mr-2 text-[sm]`}
              >
                12:15 pm
              </span>
              <IoCheckmarkDone
                className={`${message.sender === "You" ? "text-white" : "text-[#8E8E8E]"} text-lg`}
              />
            </div>
          </div>
        ))}
        <div className='message w-[45%] self-end border-2 border-[#F0EEEE] bg-[white]'>
          <div className='ml-2 flex flex-col'>
            <span className='text-[18px] text-[#636363]'>
              Placed on{" "}
              <span className='text-[#0095D9] text-[Gilroy-SemiBold]'>
                April 12, 02:24PM
              </span>
            </span>
            <span className='text-[14px] text-[#636363]'>ORD2637485858</span>
            <span className='text-sm text-[#636363]'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut dolore magna aliqua. Ut enim ad,
              nostrud exercitation commodo consequat.
            </span>
            <span className='mt-2 text-sm text-[#3F8853]'>
              Your Order was delivered
            </span>
          </div>
        </div>
        <div ref={messagesEndRef}></div>
      </div>
      <div className='rouned-full flex w-full flex-row items-center justify-center border'>
        <div className='mb-8 flex w-[80%] flex-row items-center rounded-full bg-white p-2'>
          <BiPlusCircle className='h-[25px] w-[25px] text-[#E1E1E1]' />
          <div onClick={() => fileInputRef.current.click()}>
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
          <IoSendSharp className='h-[25px] w-[25px] text-[#0095D9]' />
          {/* <button className="send-button" onClick={sendMessage}>Send</button> */}
        </div>
      </div>
    </div>
  );
};
