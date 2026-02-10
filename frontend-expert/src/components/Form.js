import { Listbox, Menu, Switch } from "@headlessui/react";
import React from "react";
import { BiLoaderCircle } from "react-icons/bi";
import DatePicker from "react-datepicker";
import { FaCheck } from "react-icons/fa";
import { AiOutlineRight } from "react-icons/ai";
import { useDoctorAuthStore } from "../store/useDoctorAuthStore";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import SmallCircularProgress from "./UsedComp/SmallCircularProgress";

export function Input({
  label,
  name,
  type,
  color,
  placeholder,
  register,
  value,
  onChange,
}) {
  return (
    <div className='w-full text-base'>
      <label className={`font-semibold text-black`}>{label}</label>
      <input
        name={name}
        {...register}
        type={type}
        placeholder={placeholder}
        className={`placeholder-font-semibold mt-3 w-full border bg-transparent p-4 text-base font-semibold placeholder-gray-400 ${
          color ? "border-border" : "border-white text-white"
        } rounded-lg focus:border focus:border-subMain`}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

// button
export function Button({ label, onClick, loading, Icon }) {
  return (
    <button
      disabled={loading}
      onClick={onClick}
      className={`flex-rows transitions w-full gap-4 rounded bg-subMain px-2 py-4 text-sm font-medium text-white hover:opacity-80`}
    >
      {loading ? (
        <BiLoaderCircle className='animate-spin text-2xl text-white' />
      ) : (
        <>
          {label}
          {Icon && <Icon className='text-xl text-white' />}
        </>
      )}
    </button>
  );
}

// profile select
export function ProfileSelect({ children, datas, progressPercentage }) {
  const navigate = useNavigate();
  const { doctor } = useDoctorAuthStore();

  // Navigate to preview (filled information view)
  const handleProfileClick = () => {
    if (!doctor?._id) return;
    // Always navigate to docprofile for preview
    navigate(`/docprofile/${doctor._id}`);
  };

  // Navigate to edit form
  const handleEditProfileClick = () => {
    navigate("/registerPersonalDetail");
  };

  return (
    <div className='relative w-full text-xs'>
      <Menu>
        <Menu.Button>{children}</Menu.Button>
        <Menu.Items
          className='absolute right-4 z-50 flex max-h-[400px] flex-col gap-2 overflow-y-auto rounded-md border border-gray-200 bg-white px-4 py-2 shadow-lg ring-1 ring-border'
          style={{ scrollbarWidth: "none" }}
        >
          {/* Image */}
          <div onClick={handleProfileClick} className='cursor-pointer'>
            <img
              src={doctor?.doctorImage || "https://via.placeholder.com/150"}
              alt='Doctor'
              className='h-8 w-8 rounded-full'
            />
          </div>

          {/* Name and Icon */}
          <div
            className='flex w-full cursor-pointer flex-row items-center justify-between border-b pb-1'
            onClick={handleProfileClick}
          >
            <span className='text-[14px] font-semibold text-black'>
              {doctor?.fullName || "Doctor Name"}
            </span>

            <AiOutlineRight
              className='h-3 w-3 cursor-pointer text-[#0095D9]'
              onClick={handleProfileClick}
            />
          </div>

          {/* List of Items */}
          {datas.map((item, index) => (
            <div key={index}>
              {item.isComponent ? (
                // Render the component directly
                item.component
              ) : (
                // Render the regular menu item with button
                <button
                  onClick={async () => {
                    if (typeof item.onClick === "function") {
                      await item.onClick();
                    } else {
                      item.onClick();
                    }
                  }}
                  className='flex h-8 w-44 items-center gap-2 p-1 text-xs text-[#71717A] hover:text-subMain'
                >
                  {item.icon && (
                    <item.icon className='h-5 w-5 text-[#71717A]' />
                  )}
                  {item.title}
                  {item.title === "HPR Profile" && (
                    <div onClick={(e) => { e.stopPropagation(); handleEditProfileClick(); }} className="cursor-pointer">
                      <SmallCircularProgress percentage={progressPercentage} />
                    </div>
                  )}
                </button>
              )}
            </div>
          ))}
        </Menu.Items>
      </Menu>
    </div>
  );
}

// select
export function MenuSelect({ children, datas, item: data }) {
  return (
    <div className='relative w-full text-sm'>
      <Menu>
        <Menu.Button>{children}</Menu.Button>
        <Menu.Items
          className='absolute right-8 z-50 flex max-h-[500px] flex-col gap-1 overflow-y-auto rounded-md bg-white px-4 py-2 shadow-lg ring-1 ring-border focus:outline-none'
          style={{ scrollbarWidth: "none" }}
        >
          {datas.map((item, index) => (
            <button
              onClick={() => item.onClick(data?._id)}
              key={index}
              className={`flex items-center gap-4 p-1 text-[12px] text-[#71717A] hover:text-subMain`}
            >
              {item.icon && <item.icon className='text-md' />}
              {item.title}
            </button>
          ))}
        </Menu.Items>
      </Menu>
    </div>
  );
}

// select 2
export function Select({ children, selectedPerson, setSelectedPerson, datas }) {
  return (
    <div className='relative w-full text-sm'>
      <div className='w-full'>
        <Listbox value={selectedPerson} onChange={setSelectedPerson}>
          <Listbox.Button className={"w-full"}>{children}</Listbox.Button>
          <Listbox.Options className='absolute left-0 top-10 z-50 flex w-full flex-col gap-4 rounded-md bg-white px-6 py-4 shadow-lg ring-1 ring-border focus:outline-none'>
            {datas.map((person) => (
              <Listbox.Option
                className={`cursor-pointer text-xs hover:text-subMain`}
                key={person.id}
                value={person.name}
                disabled={person.unavailable}
              >
                {person.name}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
      </div>
    </div>
  );
}
export function ServiceSelect({
  children,
  selectedPerson,
  setSelectedPerson,
  datas,
}) {
  return (
    <div className='relative w-full text-sm'>
      <div className='w-[100px]'>
        <Listbox value={selectedPerson} onChange={setSelectedPerson}>
          <Listbox.Button className={"w-[100px]"}>{children}</Listbox.Button>
          <Listbox.Options className='absolute left-0 top-10 z-50 flex w-[100px] flex-col gap-4 rounded-md bg-white px-6 py-4 shadow-lg ring-1 ring-border focus:outline-none'>
            {datas.map((person) => (
              <Listbox.Option
                className={`cursor-pointer text-xs hover:text-subMain`}
                key={person.id}
                value={person}
                disabled={person.unavailable}
              >
                {person.name}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
      </div>
    </div>
  );
}

// switch
export function Switchi({ checked, onChange }) {
  return (
    <Switch
      checked={checked}
      onChange={onChange}
      className={`${checked ? "bg-subMain" : "bg-border"} transitions relative inline-flex w-12 cursor-pointer rounded-full p-[2px]`}
    >
      <span
        aria-hidden='true'
        className={`${checked ? "translate-x-5" : "translate-x-0"} transitions pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg`}
      />
    </Switch>
  );
}

// textarea
export function Textarea({
  label,
  name,
  register,
  placeholder,
  rows,
  onChange,
  value,
}) {
  return (
    <div className='w-full text-sm'>
      <label className={"font-semibold text-black"}>{label}</label>
      <textarea
        name={name}
        rows={rows}
        onChange={onChange}
        value={value}
        {...register}
        placeholder={placeholder}
        className={`placeholder-font-semibold mt-3 w-full rounded border border-border bg-transparent p-4 text-base font-semibold placeholder-gray-400 focus:border-subMain`}
      />
    </div>
  );
}

export function DatePickerComp({ label, startDate, onChange }) {
  return (
    <div className='text-md w-full'>
      {label && <label className={"font-semibold text-black"}>{label}</label>}
      <DatePicker
        selected={startDate}
        onChange={onChange}
        placeholderText='Select date'
        className='placeholder-font-semibold h-10 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-semibold placeholder-gray-400 focus:border focus:border-subMain'
        style={{ height: "40px", minHeight: "40px" }}
      />
    </div>
  );
}

export function TimePickerComp({ label, startDate, onChange }) {
  return (
    <div className='text-md w-full'>
      {label && <label className={"font-semibold text-black"}>{label}</label>}
      <DatePicker
        selected={startDate}
        onChange={onChange}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={30}
        timeCaption='Time'
        dateFormat='h:mm aa'
        placeholderText='Select time'
        className='placeholder-font-semibold h-10 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-semibold placeholder-gray-400 focus:border focus:border-subMain'
        style={{ height: "40px", minHeight: "40px" }}
      />
    </div>
  );
}

// checkbox
export function Checkbox({ label, name, onChange, checked }) {
  return (
    <div className='flex w-full flex-row items-center text-sm'>
      <label className='flex-colo relative cursor-pointer'>
        <input
          type='checkbox'
          name={name}
          checked={checked}
          onChange={onChange}
          className='absolute h-0 w-0 opacity-0'
        />
        <span
          className={`mr-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border ${
            checked ? "border-subMain bg-subMain" : "border-gray-300 bg-white"
          }`}
        >
          <FaCheck
            className={`text-[10px] ${checked ? "block text-white" : "hidden"}`}
          />
        </span>
      </label>

      {label && (
        <p className={"ml-2 text-xs font-semibold text-black"}>{label}</p>
      )}
    </div>
  );
}

// from to date picker
export function FromToDate({
  label,
  startDate,
  onChange,
  endDate,
  bg,
  className,
}) {
  return (
    <div className='flex w-full flex-col gap-3 text-sm'>
      {label && <label className={"font-semibold text-black"}>{label}</label>}
      <DatePicker
        selectsRange={true}
        startDate={startDate}
        endDate={endDate}
        onChange={onChange}
        className={`w-full ${bg ? bg : "bg-transparent"} h-14 rounded-lg border border-border px-4 placeholder-gray-400 focus:border focus:border-subMain ${className}`}
      />
    </div>
  );
}
