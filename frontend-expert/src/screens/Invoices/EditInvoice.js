import React, { useState } from "react";
import Layout from "../../Layout";
import {
  Button,
  FromToDate,
  Input,
  Select,
  Textarea,
} from "../../components/Form";
import { BiChevronDown, BiPlus } from "react-icons/bi";
import PatientMedicineServiceModal from "../../components/Modals/PatientMedicineServiceModal";
import AddItemModal from "../../components/Modals/AddItemInvoiceModal";
import { invoicesData, sortsDatas } from "../../components/Datas";
import { toast } from "react-hot-toast";
import { BsSend } from "react-icons/bs";
import { Link, useParams } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import { InvoiceProductsTable } from "../../components/Tables";
import SenderReceverComp from "../../components/SenderReceverComp";
function EditInvoice() {
  const { id } = useParams();
  const [dateRange, setDateRange] = useState([
    new Date(),
    new Date(new Date().setDate(new Date().getDate() + 7)),
  ]);
  const [startDate, endDate] = dateRange;
  const [isOpen, setIsOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const [currency, setCurrency] = useState(sortsDatas.currency[0]);

  // date picker
  const onChangeDates = (update) => {
    setDateRange(update);
  };

  const invoice = invoicesData.find((invoice) => invoice.id.toString() === id);

  return (
    <Layout>
      {isOpen && (
        <PatientMedicineServiceModal
          closeModal={() => setIsOpen(!isOpen)}
          isOpen={isOpen}
          patient={true}
        />
      )}
      {itemOpen && (
        <AddItemModal
          closeModal={() => setItemOpen(!itemOpen)}
          isOpen={itemOpen}
        />
      )}
      <div className='flex items-center gap-4'>
        <Link
          to='/invoices'
          className='text-md rounded-lg border border-dashed border-subMain bg-white px-4 py-3'
        >
          <IoArrowBackOutline />
        </Link>
        <h1 className='text-xl font-semibold'>Edit Invoice</h1>
      </div>
      <div
        data-aos='fade-up'
        data-aos-duration='1000'
        data-aos-delay='100'
        data-aos-offset='200'
        className='my-8 rounded-xl border-[1px] border-border bg-white p-5'
      >
        {/* header */}
        <div className='grid grid-cols-1 items-center gap-2 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='lg:col-span-3'>
            <img
              src='/images/logo.png'
              alt='logo'
              className='w-32 object-contain'
            />
          </div>

          <div className='flex flex-col gap-4'>
            <FromToDate
              startDate={startDate}
              endDate={endDate}
              label='Dates'
              onChange={onChangeDates}
            />
          </div>
        </div>
        {/* sender and recever */}
        <SenderReceverComp
          item={invoice?.to}
          functions={{
            openModal: () => {
              setIsOpen(!isOpen);
            },
          }}
          button={true}
        />
        {/* products */}
        <div className='mt-8 grid grid-cols-6 gap-6'>
          <div className='col-span-6 overflow-hidden rounded-xl border border-border p-6 lg:col-span-4'>
            <InvoiceProductsTable
              data={invoice?.items}
              functions={{
                deleteItem: (id) => {
                  toast.error("This feature is not available yet");
                },
              }}
              button={true}
            />
            {/* add */}
            <button
              onClick={() => setItemOpen(!itemOpen)}
              className='flex-rows mt-4 w-full gap-2 rounded-lg border border-dashed border-subMain py-4 text-sm text-subMain'
            >
              <BiPlus /> Add Item
            </button>
          </div>
          <div className='col-span-6 flex flex-col gap-6 lg:col-span-2'>
            <Select
              selectedPerson={currency}
              setSelectedPerson={setCurrency}
              datas={sortsDatas?.currency}
            >
              <div className='flex h-14 w-full items-center justify-between rounded-md border border-border px-4 text-xs text-main'>
                <p>{currency?.name}</p>
                <BiChevronDown className='text-xl' />
              </div>
            </Select>
            <div className='grid gap-6 sm:grid-cols-2'>
              <Input
                label='Discount'
                color={true}
                type='number'
                placeholder={"3000"}
              />
              <Input
                label='Tax(%)'
                color={true}
                type='number'
                placeholder={"3"}
              />
            </div>
            <div className='flex-btn gap-4'>
              <p className='text-sm font-extralight'>Sub Total:</p>
              <h6 className='text-sm font-medium'>$459</h6>
            </div>
            <div className='flex-btn gap-4'>
              <p className='text-sm font-extralight'>Discount:</p>
              <h6 className='text-sm font-medium'>$49</h6>
            </div>
            <div className='flex-btn gap-4'>
              <p className='text-sm font-extralight'>Tax:</p>
              <h6 className='text-sm font-medium'>$4.90</h6>
            </div>
            <div className='flex-btn gap-4'>
              <p className='text-sm font-extralight'>Grand Total:</p>
              <h6 className='text-sm font-medium text-green-600'>$6000</h6>
            </div>
            {/* notes */}
            <Textarea
              label='Notes'
              placeholder='Thank you for your business. We hope to work with you again soon!'
              color={true}
              rows={3}
            />
            {/* button */}
            <Button
              label='Update'
              onClick={() => {
                toast.error("This feature is not available yet");
              }}
              Icon={BsSend}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default EditInvoice;
