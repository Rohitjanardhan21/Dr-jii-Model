import React from "react";
import Layout from "../Layout";
import { BiUserPlus } from "react-icons/bi";
import { RiLockPasswordLine } from "react-icons/ri";
import PersonalInfo from "../components/UsedComp/PersonalInfo";
import ChangePassword from "../components/UsedComp/ChangePassword";

function Settings() {
  const [activeTab, setActiveTab] = React.useState(1);
  const tabs = [
    {
      id: 1,
      name: "Personal Information",
      icon: BiUserPlus,
    },
    {
      id: 2,
      name: "Change Password",
      icon: RiLockPasswordLine,
    },
  ];

  const tabPanel = () => {
    switch (activeTab) {
      case 1:
        return <PersonalInfo titles={true} />;
      case 2:
        return <ChangePassword />;
      default:
        return;
    }
  };

  return (
    <Layout>
      <h1 className='text-xl font-semibold'>Settings</h1>
      <div className='my-8 grid grid-cols-12 items-start gap-6'>
        <div
          data-aos='fade-right'
          data-aos-duration='1000'
          data-aos-delay='100'
          data-aos-offset='200'
          className='flex-colo top-28 col-span-12 gap-6 rounded-xl border-[1px] border-border bg-white p-6 lg:sticky lg:col-span-4'
        >
          <img
            src='/images/user1.png'
            alt='setting'
            className='h-40 w-40 rounded-full border border-dashed border-subMain object-cover'
          />
          <div className='flex-colo gap-2'>
            <h2 className='text-sm font-semibold'>Dr. Daudi Mburuge</h2>
            <p className='text-xs text-textGray'>daudimburuge@gmail.com</p>
            <p className='text-xs'>+254 712 345 678</p>
          </div>
          {/* tabs */}
          <div className='flex-colo w-full gap-3 px-2 xl:px-12'>
            {tabs.map((tab, index) => (
              <button
                onClick={() => setActiveTab(tab.id)}
                key={index}
                className={` ${
                  activeTab === tab.id
                    ? "bg-text text-subMain"
                    : "bg-dry text-main hover:bg-text hover:text-subMain"
                } flex w-full items-center gap-4 rounded p-4 text-xs`}
              >
                <tab.icon className='text-lg' /> {tab.name}
              </button>
            ))}
          </div>
        </div>
        {/* tab panel */}
        <div
          data-aos='fade-left'
          data-aos-duration='1000'
          data-aos-delay='100'
          data-aos-offset='200'
          className='col-span-12 rounded-xl border-[1px] border-border bg-white p-6 lg:col-span-8'
        >
          {tabPanel()}
        </div>
      </div>
    </Layout>
  );
}

export default Settings;
