import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { BsGripVertical } from "react-icons/bs";

export default function ConfigurePadModal({ closeModal, isOpen, currentConfig, onSave }) {
    const [activeTab, setActiveTab] = useState("Pad Order");
    const [items, setItems] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    useEffect(() => {
        if (currentConfig) {
            setItems(JSON.parse(JSON.stringify(currentConfig)));
        }
    }, [currentConfig, isOpen]);

    const handleDragStart = (e, index) => {
        setDraggedItem(items[index]);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index);
        // Set opacity for visual feedback
        const item = e.currentTarget;
        if (item) {
            item.style.opacity = '0.5';
        }
    };

    const handleDragEnd = (e) => {
        if (e.currentTarget) {
            e.currentTarget.style.opacity = '1';
        }
        setDraggedItem(null);
        setDragOverIndex(null);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (!draggedItem) return;

        const newItems = [...items];
        const draggedIndex = newItems.findIndex(i => i.id === draggedItem.id);

        // Remove from old position
        newItems.splice(draggedIndex, 1);
        // Insert at new position
        newItems.splice(dropIndex, 0, draggedItem);

        setItems(newItems);
        setDraggedItem(null);
        setDragOverIndex(null);
    };

    const toggleEnable = (index) => {
        const newItems = [...items];
        newItems[index].enabled = !newItems[index].enabled;
        setItems(newItems);
    };

    const handleSave = () => {
        onSave(items);
        closeModal();
    };

    return (
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
                            <Dialog.Panel className='w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-0 text-left align-middle shadow-xl transition-all'>
                                {/* Header */}
                                <div className='flex items-center justify-between border-b p-4'>
                                    <div className='flex items-center gap-4'>
                                        <button
                                            onClick={closeModal}
                                            className='text-gray-600 hover:text-gray-800'
                                        >
                                            <IoArrowBackOutline size={20} />
                                        </button>
                                        <h3 className='text-lg font-medium leading-6 text-gray-900'>
                                            Configure your Pad
                                        </h3>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className='flex border-b pl-4'>
                                    {["Pad Order", ""].map((tab) => (
                                        <button
                                            key={tab}
                                            className={`px-6 py-3 text-sm font-medium ${activeTab === tab
                                                ? "border-b-2 border-blue-500 text-blue-600"
                                                : "text-gray-500 hover:text-gray-700"
                                                }`}
                                            onClick={() => setActiveTab(tab)}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {/* Content */}
                                <div className='p-6 h-[500px] overflow-y-auto'>
                                    {activeTab === "Pad Order" ? (
                                        <div>
                                            <h4 className='mb-4 text-sm font-semibold'>
                                                Order of elements on pad
                                            </h4>
                                            <div className='overflow-hidden rounded-md border'>
                                                <table className='w-full text-left text-sm text-gray-500'>
                                                    <thead className='bg-gray-50 text-xs text-gray-700 uppercase'>
                                                        <tr>
                                                            <th className='px-6 py-3'>FIELD</th>
                                                            <th className='px-6 py-3 text-center'>ENABLE / DISABLE</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className='divide-y divide-gray-200 bg-white'>
                                                        {items.map((item, index) => (
                                                            <tr
                                                                key={item.id}
                                                                draggable
                                                                onDragStart={(e) => handleDragStart(e, index)}
                                                                onDragEnd={handleDragEnd}
                                                                onDragOver={(e) => handleDragOver(e, index)}
                                                                onDragLeave={handleDragLeave}
                                                                onDrop={(e) => handleDrop(e, index)}
                                                                className={`group hover:bg-gray-50 ${draggedItem?.id === item.id ? 'opacity-50' : ''
                                                                    } ${dragOverIndex === index && draggedItem?.id !== item.id ? 'bg-blue-50 border-t-2 border-blue-300' : ''
                                                                    } cursor-move`}
                                                            >
                                                                <td className='px-6 py-4'>
                                                                    <div className='flex items-center gap-3'>
                                                                        <BsGripVertical className='text-gray-400 group-hover:text-gray-600' size={18} />
                                                                        <span className='font-medium text-gray-900'>{item.label}</span>
                                                                    </div>
                                                                </td>
                                                                <td className='px-6 py-4 text-center'>
                                                                    <button
                                                                        onClick={() => toggleEnable(index)}
                                                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${item.enabled ? 'bg-blue-600' : 'bg-gray-200'
                                                                            }`}
                                                                    >
                                                                        <span
                                                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.enabled ? 'translate-x-5' : 'translate-x-0'
                                                                                }`}
                                                                        />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='flex h-full items-center justify-center text-gray-500'>
                                            Settings content coming soon...
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className='flex justify-between border-t bg-gray-50 p-4'>
                                    <button
                                        onClick={closeModal}
                                        className='rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className='rounded-md bg-blue-900 px-6 py-2 text-sm font-medium text-white hover:bg-blue-800'
                                    >
                                        Save
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
