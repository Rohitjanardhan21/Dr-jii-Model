import React from "react";
import { MdOutlineCloudDownload } from "react-icons/md";
import { toast } from "react-hot-toast";
import { BiPlus } from "react-icons/bi";
import Layout from "../Layout";
import { Button } from "../components/Form";
import { DoctorsTable } from "../components/Tables";
import AddDoctorModal from "../components/Modals/AddDoctorModal";
import { receptionsData } from "../components/Datas";

function Receptions() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [data, setData] = React.useState({});

  const onCloseModal = () => {
    setIsOpen(false);
    setData({});
  };

  const preview = (data) => {
    setIsOpen(true);
    setData(data);
  };

  return (
    <Layout>
      {
        // add doctor modal
        isOpen && (
          <AddDoctorModal
            closeModal={onCloseModal}
            isOpen={isOpen}
            doctor={false}
            datas={data}
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
      <h1 className='text-xl font-semibold'>Receptions</h1>
      <div
        data-aos='fade-up'
        data-aos-duration='1000'
        data-aos-delay='100'
        data-aos-offset='200'
        className='my-8 rounded-xl border-[1px] border-border bg-white p-5'
      >
        {/* datas */}

        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-6'>
          <div className='grid items-center gap-6 md:col-span-5 lg:grid-cols-4'>
            <input
              type='text'
              placeholder='Search "Amina Mwakio"'
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
            doctor={false}
            data={receptionsData}
            functions={{
              preview: preview,
            }}
          />
        </div>
      </div>
    </Layout>
  );
}

export default Receptions;
