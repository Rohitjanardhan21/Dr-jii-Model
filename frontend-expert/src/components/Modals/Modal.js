import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaTimes } from "react-icons/fa";
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function Modal({ closeModal, isOpen, width, children, title, showCloseButton = true }) {
  const navigate = useNavigate();
  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-50' onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-300'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel
                  className={`w-full ${width ? width : "max-w-4xl"
                    } transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all`}
                >
                  <div className='flex-btn mb-8 w-full gap-2'>
                    <div className='flex flex-row items-center justify-center gap-4'>
                      <button
                        onClick={closeModal}
                        className='rounded-lg border border-dashed border-subMain bg-white px-3 py-2 text-sm'
                      >
                        <IoArrowBackOutline />
                      </button>
                      <h1 className='text-md font-semibold'>{title}</h1>
                    </div>
                    <div className="flex flex-row ">
                      
                      <button
                        onClick={closeModal}
                        className='flex-colo h-6 w-14 rounded-md bg-dry text-red-600 '
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                  {children}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
