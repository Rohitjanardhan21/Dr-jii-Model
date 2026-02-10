import React, { useEffect, useState, useCallback } from "react";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";
import { MdEditNote } from "react-icons/md";
import { TbNotebook } from "react-icons/tb";
import { PiArrowFatDown, PiArrowFatUp } from "react-icons/pi";
import { IoChatbubbleOutline } from "react-icons/io5";
import { FiRefreshCcw } from "react-icons/fi";
import { BsFillQuestionOctagonFill, BsThreeDots } from "react-icons/bs";
import {  formatDate } from "../Assets/Data";

export default function DoCare(props) {
  const [allData, setAllData] = useState([]);
  const [doCareData, setDoCareData] = useState([]);

  const fetchUserData = useCallback(async (id) => {
    try {
      const response1 = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/user/getUserSingle/${id}`);

      const json = await response1.json();

      console.log("json1:", json?.data?._id, json?.data?.fullName);
      if (json.data._id || json.data.fullName) {
        setAllData((prev) => [
          ...prev,
          { id: json?.data?._id, name: json?.data?.fullName },
        ]);
      }
      console.log("all fetching:", allData);
    } catch (e) {
      console.log("error fetching post...", e);
    }
  }, [allData]);

  const fetchDrData = useCallback(async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/getDoctorProfile/${id}`);

      const json = await response.json();

      console.log("json1:", json.data._id, json?.data?.fullName);
      if (json.data._id || json.data.fullName) {
        setAllData((prev) => [
          ...prev,
          { id: json?.data?._id, name: json?.data?.fullName },
        ]);
      }
      console.log("all fetching:", allData);
    } catch (e) {
      console.log("error fetching post...", e);
    }
  }, [allData]);

  const fetchDocare = useCallback(async () => {
    try {
      // const postId = await AsyncStorage.getItem("profileId");
      // setId(postId);
      const response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/getAlldoCares`);
      const json = await response.json();
      console.log("json:", json.data[0].comments[0]);
      json.data.map(async (item) => {
        await fetchUserData(item.senderId);
        await fetchDrData(item.senderId);
      });

      const check = json.data[1].like?.find((item) => item === props.id);
      console.log("check:", check);

      if (json.data) {
        console.log("json11:", json.data);
        setDoCareData(json.data);
      }
    } catch (e) {
      console.error("error fetching DoCare...", e);
    }
  }, [props.id, fetchUserData, fetchDrData]);

  useEffect(() => {
    fetchDocare();
  }, [fetchDocare]);

  return (
    <div className='flex w-full flex-col items-center'>
      <div className='flex w-full flex-row items-center'>
        <h4 className='text-[28px] text-[#0097DB] text-[Gilroy-SemiBold]'>
          DoCare
        </h4>
        <div className='ml-4 flex h-[45px] w-[30%] flex-row items-center justify-center rounded-xl border p-1'>
          <img
            src={require("../Assets/images/search.png")}
            alt='Search'
            className='ml-2 mr-2 h-[16px] w-[16px] text-[#CDCED0]'
          />
          <input
            className='w-full text-start text-[14px]'
            type='text'
            placeholder='Search DoCare'
          />
        </div>
      </div>
      <div className='mt-4 h-[1px] w-full bg-[#D7D7D7]' />
      <div className='mt-4 flex w-full flex-row items-center'>
        <img
          src='/images/user1.png'
          alt='User profile'
          className='h-12 w-12 rounded-full object-cover'
        />
        <div className='ml-4 w-full rounded-full border p-2'>
          <span className='text-md pl-4 text-[#717171]'>
            What do you want to ask or share?
          </span>
        </div>
      </div>
      <div className='mt-4 flex w-full flex-row items-center'>
        <div className='flex w-32 flex-row items-center bg-[#F8F8F8] p-2'>
          <AiOutlineQuestionCircle className='ml-2 h-4 w-4' />
          <span className='text-md pl-2 text-[#717171]'>Ask</span>
        </div>
        <div className='ml-4 flex w-32 flex-row items-center bg-[#F8F8F8] p-2'>
          <MdEditNote className='ml-2 h-4 w-4' />
          <span className='text-md pl-2 text-[#717171]'>Answer</span>
        </div>
        <div className='ml-4 flex w-32 flex-row items-center bg-[#F8F8F8] p-2'>
          <TbNotebook className='ml-2 h-4 w-4' />
          <span className='text-md pl-2 text-[#717171]'>Post</span>
        </div>
      </div>
      <FirstSect data={doCareData} allData={allData} />
      {/* <SecondSect /> */}
      <div className='flex w-full flex-row items-center'>
        <BsFillQuestionOctagonFill className='ml-2 h-[32px] w-[32px] text-[#0097DB]' />
        <span className='ml-4 text-[18px] text-[Gilroy-SemiBold] text-[black]'>
          Questions for you
        </span>
      </div>
      <div className='mt-4 h-[1px] w-full bg-[#D7D7D7]' />
      <ThirdSect data={doCareData} />
      <ForthSect />
    </div>
  );
}

const FirstSect = (props) => {
  const getPosterData = (id) => {
    if (props.data) {
      const data = props.allData.find((item) => item.id === id);
      const name = data ? data?.name : "Unknown";
      return name;
    }
  };
  return (
    <>
      {props?.data?.map(
        (item) =>
          item.type === "post" && (
            <div
              data-aos='fade-up'
              data-aos-duration='1000'
              data-aos-delay='100'
              data-aos-offset='200'
              className='my-8 flex w-full flex-col rounded-xl border-[1px] border-border bg-white p-5'
            >
              <div className='flex w-full flex-row items-start justify-between p-2'>
                <div className='flex flex-row items-center'>
                  <span className='h-[40px] w-[40px] rounded-full bg-[#0095D9] text-center text-[28px] text-[Gilroy-SemiBold] text-white'>
                    S
                  </span>
                  <div className='flex flex-col pl-4'>
                    <div className='flex flex-row'>
                      <span className='text-[18px] text-[#555555] text-[Gilroy-SemiBold]'>
                        {props.allData && getPosterData(item.senderId)}
                      </span>
                      <span className='text-[18px] text-[#0097DB] text-[Gilroy-SemiBold]'>
                        . Follow
                      </span>
                    </div>
                    <span className='text-md text-[#555555]'>
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>
                <RxCross2 className='h-[20px] w-[20px] text-black' />
              </div>
              <span className='mt-4 pl-2 text-[20px] text-[Gilroy-SemiBold] text-[black]'>
                {item.text}
              </span>
              {item.image && (
                <img
                  src={item.image}
                  alt='Post content'
                  className='mt-4 h-[170px] w-full rounded-lg'
                />
              )}
              {/* <span className="text-[#898989] text-[Gilroy-SemiBold] text-[14px] mt-2 pl-2">
                        There are so many freelancer who can help you with that
                    </span> */}
              <div className='flex w-full flex-row items-center justify-between p-2'>
                <div className='mt-4 flex w-full flex-row items-center'>
                  <div className='flex w-36 flex-row items-center justify-between rounded-xl border border-[#DEDEDE] p-2 pl-4 pr-4'>
                    <PiArrowFatUp className='h-4 w-4 text-[#0095D9]' />
                    <span className='text-md text-[#717171]'>Upvote</span>
                    <PiArrowFatDown className='h-4 w-4' />
                  </div>
                  <IoChatbubbleOutline className='ml-2 h-6 w-6 text-black' />
                  <FiRefreshCcw className='ml-2 h-6 w-6 text-black' />
                </div>
                <BsThreeDots className='ml-2 h-6 w-6 text-black' />
              </div>
            </div>
          )
      )}
    </>
  );
};

// Unused component - commented out
// const SecondSect = () => {
//   return (
//     <div
//       data-aos='fade-up'
//       data-aos-duration='1000'
//       data-aos-delay='100'
//       data-aos-offset='200'
//       className='my-8 flex w-full flex-col items-center rounded-xl border-[1px] border-border bg-white p-5'
//     >
//       <div className='flex w-full flex-row items-start justify-between p-2'>
//         <div className='flex flex-row items-center'>
//           <img
//             src={require("../Assets/images/sponsor.png")}
//             alt='Sponsor'
//             className='h-[40px] w-[40px] rounded-full'
//           />
//           <div className='flex flex-col pl-4'>
//             <div className='flex flex-row'>
//               <span className='text-[18px] text-[Gilroy-SemiBold] text-[black]'>
//                 Life Insurance Corporation
//               </span>
//             </div>
//             <span className='text-md text-[#555555]'>Sponsored</span>
//           </div>
//         </div>
//         <RxCross2 className='h-[20px] w-[20px] text-black' />
//       </div>
//       <span className='mt-4 pl-2 text-[18px] text-[Gilroy-SemiBold] text-[black]'>
//         New jeevan Akshay Lic's
//       </span>
//       <span className='mt-2 pl-2 text-[14px] text-[#898989] text-[Gilroy-SemiBold]'>
//         An immediate annuity paln that can be purchase by payinga lump ammount.
//       </span>
//       <img
//         src='https://s3-alpha-sig.figma.com/img/46e3/8cf8/ebf50f1347d3f8998d555830917aa870?Expires=1728259200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=C2vNzPcEFXIN7DX6GOyrHK41AIuyQcLXAEhZ2J6ErpL2HNnyfMi8e6euSWySkH3zNxCZOXBLZDQX8Aw2aH2xjn0aEOU1T2Bf5X5Jh7ctLAuHdn6eRGiotPSX4nW0NoPMKNQQY5ecdRAutIKIX1m83VvRz6kFGJD7-oHrPXb6T3~pf1ktS4jBfj9H~QR9TSW3gvLRoBPiVHJRmJcgXC7X1Qah4q5davTLlZgNGS4MSmbi~-ctEJewuQTHUm3qTpToqq7BGWpSQvFoNPtpil6U4BHWeUmuP~6Seqgc-qqGgUF97a-QBCpStC5lXFlayWoCMiCfc-dsge6raTlT-ouw6g__'
//         alt='Advertisement'
//         className='mt-4 h-[170px] w-full rounded-lg'
//       />
//       <div className='jusify-between mt-4 flex w-[90%] flex-row items-center rounded-full border-2 border-[#0095D9] p-2'>
//         <span className='text-md w-full pl-4 text-center text-[#0095D9]'>
//           Learn More
//         </span>
//         <RiEditBoxLine className='mr-4 h-6 w-6 text-[#0095D9]' />
//       </div>
//       <div className='flex w-full flex-row items-center justify-between p-2'>
//         <div className='mt-4 flex w-full flex-row items-center'>
//           <div className='flex w-36 flex-row items-center justify-between rounded-xl border border-[#DEDEDE] p-2 pl-4 pr-4'>
//             <PiArrowFatUp className='h-4 w-4 text-[#0095D9]' />
//             <span className='text-md text-[#717171]'>Upvote</span>
//             <PiArrowFatDown className='h-4 w-4' />
//           </div>
//           <IoChatbubbleOutline className='ml-2 h-6 w-6 text-black' />
//           <FiRefreshCcw className='ml-2 h-6 w-6 text-black' />
//         </div>
//         <PiArrowFatDown className='mr-2 h-[19] w-[18] text-[#555555]' />
//         <BsThreeDots className='ml-2 h-6 w-6 text-black' />
//       </div>
//     </div>
//   );
// };

const ThirdSect = (props) => {
  return (
    <>
      {props?.data?.map(
        (item) =>
          item.type === "question" && (
            <div
              data-aos='fade-up'
              data-aos-duration='1000'
              data-aos-delay='100'
              data-aos-offset='200'
              className='my-8 flex w-full flex-col border-b-[1px] border-[#C3C3C3] bg-white p-5'
            >
              <div className='flex w-full flex-row items-start justify-between p-2'>
                <div className='flex w-full flex-row items-center'>
                  <span className='text-[20px] text-[Gilroy-SemiBold] text-black'>
                    {item.question}
                  </span>
                </div>
                <RxCross2 className='h-[20px] w-[20px] text-black' />
              </div>
              <span className='mt-2 pl-2 text-[14px] text-[#898989] text-[Gilroy-SemiBold]'>
                No answer yet. Last requested 4
              </span>
              <div className='flex w-full flex-row items-center justify-between p-2'>
                <div className='mt-4 flex w-full flex-row items-center'>
                  <div className='flex w-32 flex-row items-center bg-[#F8F8F8] p-2'>
                    <img
                      src={require("../Assets/images/answer.png")}
                      alt='Answer icon'
                      className='ml-2 h-4 w-4'
                    />
                    <span className='text-md pl-2 text-[#717171]'>Answer</span>
                  </div>
                  <div className='ml-4 flex w-32 flex-row items-center bg-[#F8F8F8] p-2'>
                    <img
                      src={require("../Assets/images/follow.png")}
                      alt='Follow icon'
                      className='ml-2 h-4 w-4'
                    />
                    <span className='text-md pl-2 text-[#717171]'>Follow</span>
                  </div>
                  <div className='ml-4 flex w-32 flex-row items-center bg-[#F8F8F8] p-2'>
                    <img
                      src={require("../Assets/images/pass.png")}
                      alt='Pass icon'
                      className='ml-2 h-4 w-4'
                    />
                    <span className='text-md pl-2 text-[#717171]'>Pass</span>
                  </div>
                </div>
                <PiArrowFatDown className='mr-2 h-[19] w-[18] text-[#555555]' />
                <BsThreeDots className='ml-2 h-6 w-6 text-black' />
              </div>
            </div>
          )
      )}
    </>
  );
};

const ForthSect = () => {
  return (
    <div
      data-aos='fade-up'
      data-aos-duration='1000'
      data-aos-delay='100'
      data-aos-offset='200'
      className='my-8 flex w-full flex-col border-b-[1px] border-[#C3C3C3] bg-white p-5'
    >
      <div className='flex w-full flex-row items-start justify-between p-2'>
        <div className='flex w-full flex-col items-start'>
          <span className='text-[20px] text-[Gilroy-SemiBold] text-black'>
            Add 5 topics you know about
          </span>
          <span className='mt-2 text-[14px] text-[#898989] text-[Gilroy-SemiBold]'>
            You ‘ll get better questions if you add more specific topics.
          </span>
          <div className='mt-4 flex w-28 flex-row items-center justify-center rounded-full border border-[#0097DB] bg-[white] p-2'>
            <span className='text-md text-[#0097DB]'>Create</span>
          </div>
        </div>
        <img
          src={require("../Assets/images/notebook.png")}
          alt='Notebook'
          className='ml-2 h-[96px] w-[96px] text-black'
        />
      </div>
    </div>
  );
};
