import React, { useEffect, useState } from "react";
import Layout from "../../Layout";
import { Button } from "../../components/Form";
import { MdOutlineCloudDownload } from "react-icons/md";
import { toast } from "react-hot-toast";
import { InvoiceTable } from "../../components/Tables";
import { invoicesData } from "../../components/Datas";
import { BiPlus } from "react-icons/bi";
import { Link } from "react-router-dom";

function Invoices() {
  const [invoiceData, setInvoiceData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/getAllInvoices`);
      const json = await response.json();
      setInvoiceData(json.data);
    } catch (e) {
      console.log("error fetching...", e);
    }finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
      return (  
        <Layout>
          <p>Loading...</p>
        </Layout>
      );
    }

  return (
    <Layout>
      {/* add button */}
      <Link
        to='/invoices/create'
        className='flex-colo button-fb fixed bottom-8 right-12 z-50 h-16 w-16 animate-bounce rounded-full border border-border bg-subMain text-white'
      >
        <BiPlus className='text-2xl' />
      </Link>
      {/*  */}
      <h1 className='text-xl font-semibold'>Invoices</h1>
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
              placeholder='Search "patient name"'
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
          <InvoiceTable data={invoiceData} />
        </div>
      </div>
    </Layout>
  );
}

export default Invoices;
