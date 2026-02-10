import React, { useEffect, useState } from "react";
import { MdOutlineCloudDownload } from "react-icons/md";
import { toast } from "react-hot-toast";
import { BiChevronDown, BiPlus } from "react-icons/bi";
import Layout from "../Layout";
import { Button, Select } from "../components/Form";
import { MedicineTable } from "../components/Tables";
import { sortsDatas } from "../components/Datas";
import AddEditMedicineModal from "../components/Modals/AddEditMedicine";

function Medicine() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [data, setData] = React.useState({});
  const [status, setStatus] = React.useState(sortsDatas.stocks[0]);
  const [medicineData, setMedicineData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/getAllMedicines`);
      const json = await response.json();
      setMedicineData(json.data);
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
    setData({});
  };

  const onEdit = (datas) => {
    setIsOpen(true);
    setData(datas);
  };
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
        <AddEditMedicineModal
          datas={data}
          isOpen={isOpen}
          closeModal={onCloseModal}
        />
      )}
      {/* add button */}
      <button
        onClick={() => setIsOpen(true)}
        className='flex-colo button-fb fixed bottom-8 right-12 z-50 h-16 w-16 animate-bounce rounded-full border border-border bg-subMain text-white'
      >
        <BiPlus className='text-2xl' />
      </button>
      {/*  */}
      <h1 className='text-xl font-semibold'>Medicine</h1>
      <div
        data-aos='fade-up'
        data-aos-duration='1000'
        data-aos-delay='100'
        data-aos-offset='200'
        className='my-8 rounded-xl border-[1px] border-border bg-white p-5'
      >
        {/* datas */}

        <div className='grid grid-cols-1 gap-2 md:grid-cols-6'>
          <div className='grid items-center gap-2 xs:grid-cols-2 md:col-span-5 lg:grid-cols-4'>
            <input
              type='text'
              placeholder='Search "paracetamol"'
              className='h-14 w-full rounded-md border border-border bg-dry px-4 text-sm text-main'
            />
            <Select
              selectedPerson={status}
              setSelectedPerson={setStatus}
              datas={sortsDatas.stocks}
            >
              <div className='flex-btn w-full rounded-lg border border-border bg-dry p-4 text-sm font-light text-main focus:border focus:border-subMain'>
                {status.name} <BiChevronDown className='text-xl' />
              </div>
            </Select>
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
          <MedicineTable data={medicineData} onEdit={onEdit} />
        </div>
      </div>
    </Layout>
  );
}

export default Medicine;
