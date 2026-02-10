import React, { useEffect, useState } from "react";
import Layout from "../Layout";
import { Button, MenuSelect } from "../components/Form";
import { BiDotsVerticalRounded, BiPlus } from "react-icons/bi";
import { HiOutlineMail } from "react-icons/hi";
import { RiDeleteBinLine } from "react-icons/ri";
import { toast } from "react-hot-toast";
import { TbBrandWhatsapp, TbMessage } from "react-icons/tb";
import CampaignModal from "../components/Modals/AddCampagnModal";
import { FiEye } from "react-icons/fi";
import {  formatDate } from "../Assets/Data";

function Campaings() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [data, setData] = React.useState({});
  const [campaignData, setCampaignData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/getAllCampaigns`);
      const json = await response.json();
      setCampaignData(json.data);
      console.log("json:", json.data);
    } catch (e) {
      console.log("error fetching...", e);
    }finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const closeModal = () => {
    setIsOpen(!isOpen);
    setData({});
  };

  const actions = [
    {
      title: "View",
      icon: FiEye,
      onClick: (data) => {
        setIsOpen(true);
        setData(data);
      },
    },
    {
      title: "Delete",
      icon: RiDeleteBinLine,
      onClick: () => {
        toast.error("This feature is not available yet");
      },
    },
  ];

  if (loading) {
      return (  
        <Layout>
          <p>Loading...</p>
        </Layout>
      );
    }

  return (
    <Layout>
      {isOpen && (
        <CampaignModal isOpen={isOpen} closeModal={closeModal} data={data} />
      )}
      <div className='flex-btn flex-wrap items-center gap-4'>
        <h1 className='text-xl font-semibold'>Campaings</h1>
        <div className='xs:w-56'>
          <Button
            label='New Campaing'
            Icon={BiPlus}
            onClick={() => {
              closeModal();
            }}
          />
        </div>
      </div>

      <div
        data-aos='fade-up'
        data-aos-duration='1000'
        data-aos-delay='100'
        data-aos-offset='200'
        className='my-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
      >
        {campaignData.map((item, index) => (
          <div
            key={index}
            className='rounded-xl border-[1px] border-border bg-white p-5'
          >
            <div className='grid grid-cols-12 items-center gap-4 border-b border-border pb-4'>
              <div className='col-span-2'>
                <div
                  className={`flex-colo h-12 w-full rounded bg-blue-500 bg-opacity-10 text-lg text-blue-500`}
                >
                  <TbMessage />
                  {/* {item.type === 'email' && <HiOutlineMail />}
                  {item.type === 'sms' && <TbMessage />}
                  {item.type === 'whatsapp' && <TbBrandWhatsapp />} */}
                </div>
              </div>
              <div className='col-span-8'>
                <h1 className='text-sm font-light'>{item.titleName}</h1>
                <p className='mt-1 text-xs font-medium'>{item.secondTitle}</p>
              </div>
              <div className='col-span-2'>
                <MenuSelect datas={actions} item={item}>
                  <div className='flex-colo h-12 w-12 rounded text-lg hover:bg-subMain hover:bg-opacity-10 hover:text-subMain'>
                    <BiDotsVerticalRounded />
                  </div>
                </MenuSelect>
              </div>
            </div>
            {/* message */}
            <div className='mt-4 flex flex-col gap-3'>
              <h4 className='text-sm font-medium'>Message</h4>
              <p className='text-xs leading-5 text-textGray'>
                {item.description}....
              </p>
              <div className='flex gap-2'>
                <span className='rounded-xl border border-border bg-dry px-4 py-2 text-xs text-textGray'>
                  {formatDate(item.date)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Campaings;
