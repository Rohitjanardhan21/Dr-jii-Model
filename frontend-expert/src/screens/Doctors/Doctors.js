import React, { useEffect, useState } from "react";
import { MdOutlineCloudDownload } from "react-icons/md";
import { toast } from "react-hot-toast";
import { BiPlus } from "react-icons/bi";
import Layout from "../../Layout";
import { Button } from "../../components/Form";
import { DoctorsTable } from "../../components/Tables";
import { useNavigate } from "react-router-dom";
import AddDoctorModal from "../../components/Modals/AddDoctorModal";

function Doctors() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [doctorsData, setDoctorData] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/getAllDoctorProfile`);
      const json = await response.json();
      setDoctorData(json.data);
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

  const onCloseModal = () => {
    setIsOpen(false);
  };

  const preview = (data) => {
    navigate(`/doctors/preview/${data._id}`);
  };

  if (loading) {
      return (  
        <Layout>
          <p>Loading...</p>
        </Layout>
      );
    }

  return (
    <>
      {
        // add doctor modal
        isOpen && (
          <AddDoctorModal
            closeModal={onCloseModal}
            isOpen={isOpen}
            doctor={true}
            datas={null}
          />
        )
      }
      {/* add button */}
      <button
        onClick={() => setIsOpen(true)}
        className='flex-colo button-fb fixed bottom-8 right-12 z-50 h-16 w-16 animate-bounce rounded-full border border-border bg-subMain text-white'
      >
        <BiPlus className='text-2xl' />
      </button>
      {/*  */}
      <div className='flex flex-row items-end p-4 pb-0'>
        <h1 className='text-[38px] font-[600] text-black'>avijo</h1>
        <h6 className='text-[24px] font-[500] italic text-[#FD7979]'>
          Experts
        </h6>
      </div>
      <div
        data-aos='fade-up'
        data-aos-duration='1000'
        data-aos-delay='100'
        data-aos-offset='200'
        className='m-8 my-8 rounded-xl border-[1px] border-border bg-white p-4'
      >
        {/* datas */}

        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-6'>
          <div className='grid items-center gap-6 md:col-span-5 lg:grid-cols-4'>
            <input
              type='text'
              placeholder='Search "daudi mburuge"'
              className='h-14 w-full rounded-md border border-border bg-dry px-4 text-sm text-main'
            />
          </div>

          {/* export */}
          <Button
            label='Export'
            Icon={MdOutlineCloudDownload}
            onClick={() => {
              toast.error("Exporting is not available yet");
            }}
          />
        </div>
        <div className='mt-8 w-full overflow-x-scroll'>
          <DoctorsTable
            doctor={true}
            data={doctorsData}
            functions={{
              preview: preview,
            }}
          />
        </div>
      </div>
    </>
  );
}

export default Doctors;
