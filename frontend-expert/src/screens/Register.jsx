import React, { useCallback, useState } from "react";
import "react-modern-drawer/dist/index.css";
import { HiMenu } from "react-icons/hi";

import { MdVerified, MdErrorOutline } from "react-icons/md";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { districts, subDistricts } from "../data/Master_Data_JSON.js";
import MainHeader from "../Layout/MainHeader.jsx";
// import Sidebar from "../../Layout/Sidebar";
// import Header from "../../Layout/Header";


export const RegisterHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <>
    {/* <Layout title="Register">
        <div>
          {/* Your Register form goes here 
        </div>
      </Layout>
     */}

      {/* <MainHeader />
      <div className='flex items-center justify-between bg-gray-100 p-4 shadow-md'>
        {/* Menu Icon */}
        {/* <button onClick={toggleDrawer} className='focus:outline-none'>
          <HiMenu className='h-8 w-8' />
        </button> */}

        {/* User Avatar */}
        {/* <div>
          <img
            src='https://avatar.iran.liara.run/public'
            alt='User Avatar'
            className='h-12 w-12 rounded-full'
          />
        </div>
      </div> */} 

      {/* Drawer
      {isOpen && (
        <div
          className='fixed inset-0 z-50 bg-black bg-opacity-50'
          onClick={toggleDrawer}
        >
          <div
            className='fixed left-0 top-0 h-full w-64 bg-white p-4 shadow-lg'
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className='text-xl font-semibold'>Drawer Content</h2>
            <p className='mt-2'>This is the content inside the drawer.</p>
          </div>
        </div>
      )} */}
    </>
  );
};

const RegisterFooter = () => {
  return (
    <footer className='mt-8 overflow-x-hidden text-center'>
      <div className='w-full'>
        <h2 className='text-2xl font-semibold'>Need Help?</h2>
        <p className='mt-2'>
          If you have questions regarding Healthcare Professional ID, please go
          through our{" "}
          <a href='/faqs' className='text-blue-600 underline'>
            FAQs section
          </a>
          .
        </p>
        <p className='mt-2'>
          If you are not able to register or are facing other issues with
          registration, please contact us at{" "}
          <a href='mailto:support@avjp.in' className='text-blue-600 underline'>
            avjp.in
          </a>
        </p>
        <p className='mt-2'>
          Or call us at our toll-free number -{" "}
          <strong>1800-11-4477 / 14477</strong>
        </p>
        <button className='mt-4 rounded-md bg-blue-600 px-6 py-3 text-lg text-white'>
          Get Help
        </button>
      </div>
    </footer>
  );
};

const Register = () => {
  const methods = useForm();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;

  const mobileValue = watch("mobile", "");
  const isValidMobile = /^[0-9]{10}$/.test(mobileValue);
  const navigate = useNavigate();

  const savePhase1 = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return null;
    }
    console.log("This is the data for this form = ", data);
    try {
      localStorage.setItem("allPersonalDataUser", JSON.stringify([data]));
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
      return;
    }

    React.startTransition(() => {
      navigate("/registerPersonalDetail");
    });
  };

  return (
    <>
      <main className='bg-light min-vh-100'>
        <RegisterHeader />
        <section className='my-2 bg-white p-4 shadow-lg'>
          <h2 className='text-primary'>
            Registration Form (Mobile verification is required)
          </h2>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(savePhase1)}>
              {/* Mobile Number & Email */}
              <div className='mb-3 flex flex-wrap gap-4'>
                {/* Mobile Number */}
                <div className='w-full md:w-1/3'>
                  <label className='block text-sm font-medium'>
                    Mobile Number
                  </label>
                  <div className='flex items-center overflow-hidden rounded-md border'>
                    <input
                      type='tel'
                      placeholder='Enter Your Number'
                      {...register("mobile", {
                        required: "Mobile number is required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Enter a valid 10-digit number",
                        },
                      })}
                      className={`w-full px-3 py-2 outline-none ${
                        errors.mobile ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <span className='px-3'>
                      {mobileValue.length > 0 ? (
                        isValidMobile ? (
                          <MdVerified className='text-green-500' />
                        ) : (
                          <MdErrorOutline className='text-red-500' />
                        )
                      ) : null}
                    </span>
                  </div>
                  {errors.mobile && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.mobile.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className='w-full md:w-1/3'>
                  <label className='block text-sm font-medium'>Email</label>
                  <div className='flex items-center overflow-hidden rounded-md border'>
                    <input
                      type='email'
                      placeholder='Enter Email'
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value:
                            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                          message: "Enter a valid email",
                        },
                      })}
                      className='w-full border-gray-300 px-3 py-2 outline-none'
                    />
                    <button
                      type='button'
                      className='bg-blue-500 px-3 py-2 text-white hover:bg-blue-600'
                    >
                      Verify
                    </button>
                  </div>
                  {errors.email && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className='w-full md:w-1/3'>
                  <label className='block text-sm font-medium'>
                    Date of Birth
                  </label>
                  <input
                    type='date'
                    {...register("dob", {
                      required: "Date of birth is required",
                    })}
                    max={new Date().toISOString().split("T")[0]}
                    className='w-full rounded-md border border-gray-300 px-3 py-2 outline-none'
                  />
                  {errors.dob && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.dob.message}
                    </p>
                  )}
                </div>
              </div>

              {/* District & Sub-District */}
              <div className='mb-3 flex flex-wrap gap-4'>
                {/* District */}
                <div className='w-full md:w-1/2'>
                  <label className='block text-sm font-medium'>District</label>
                  <select
                    {...register("district", { required: "Select a district" })}
                    className='w-full rounded-md border border-gray-300 px-3 py-2 outline-none'
                  >
                    {districts.map((item, index) => (
                      <option key={index} value={index}>
                        {item.districtName}
                      </option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.district.message}
                    </p>
                  )}
                </div>

                {/* Sub District */}
                <div className='w-full md:w-1/2'>
                  <label className='block text-sm font-medium'>
                    Sub District
                  </label>
                  <select
                    {...register("subDistrict", {
                      required: "Select a sub-district",
                    })}
                    className='w-full rounded-md border border-gray-300 px-3 py-2 outline-none'
                  >
                    {subDistricts.map((item, index) => (
                      <option key={index} value={index}>
                        {item.subDistrictName}
                      </option>
                    ))}
                  </select>
                  {errors.subDistrict && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.subDistrict.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Roles Selection */}
              <div className='mb-3'>
                {/* Roles */}
                <div className='w-full'>
                  <label className='block text-sm font-medium'>Roles</label>
                  <div className='mt-2 flex flex-col space-y-2'>
                    <label className='flex items-center space-x-2'>
                      <input
                        type='radio'
                        value='healthcare'
                        {...register("role", {
                          required: "Please select a role",
                        })}
                        className='h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span>Healthcare Professional</span>
                    </label>

                    <label className='flex items-center space-x-2'>
                      <input
                        type='radio'
                        value='manager'
                        {...register("role")}
                        className='h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span>Facility Manager / Administrator</span>
                    </label>

                    <label className='flex items-center space-x-2'>
                      <input
                        type='radio'
                        value='both'
                        {...register("role")}
                        className='h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span>Healthcare Professional & Facility Manager</span>
                    </label>
                  </div>
                  {errors.role && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.role.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Category & Sub-Category */}
              <div className='mb-3 flex flex-wrap gap-4'>
                {/* Category */}
                <div className='w-full md:w-1/2'>
                  <label className='block text-sm font-medium'>Category</label>
                  <select
                    {...register("category", { required: "Select a category" })}
                    className='w-full rounded-md border border-gray-300 px-3 py-2 outline-none'
                  >
                    <option value=''>Select Category</option>
                    <option value='cat1'>Category 1</option>
                    <option value='cat2'>Category 2</option>
                  </select>
                  {errors.category && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Sub Category */}
                <div className='w-full md:w-1/2'>
                  <label className='block text-sm font-medium'>
                    Sub Category
                  </label>
                  <select
                    {...register("subCategory", {
                      required: "Select a sub-category",
                    })}
                    className='w-full rounded-md border border-gray-300 px-3 py-2 outline-none'
                  >
                    <option value=''>Select Sub-Category</option>
                    <option value='subcat1'>Sub Category 1</option>
                    <option value='subcat2'>Sub Category 2</option>
                  </select>
                  {errors.subCategory && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.subCategory.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Username & Password */}
              <div className='mb-3 flex flex-wrap gap-4'>
                {/* Username */}
                <div className='w-full md:w-1/3'>
                  <label className='block text-sm font-medium'>
                    Healthcare Professional ID/Username
                  </label>
                  <input
                    type='text'
                    placeholder='@hpr.abdm'
                    {...register("username", {
                      required: "Username is required",
                    })}
                    className='w-full rounded-md border border-gray-300 px-3 py-2 outline-none'
                  />
                  {errors.username && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className='w-full md:w-1/3'>
                  <label className='block text-sm font-medium'>Password</label>
                  <input
                    type='password'
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    className='w-full rounded-md border border-gray-300 px-3 py-2 outline-none'
                  />
                  {errors.password && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className='w-full md:w-1/3'>
                  <label className='block text-sm font-medium'>
                    Confirm Password
                  </label>
                  <input
                    type='password'
                    {...register("confirmPassword", {
                      required: "Confirm your password",
                    })}
                    className='w-full rounded-md border border-gray-300 px-3 py-2 outline-none'
                  />
                  {errors.confirmPassword && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Reset & Submit Buttons */}
              <div className='mb-3 flex justify-between gap-2'>
                <button
                  type='reset'
                  className='w-1/2 rounded-md bg-gray-500 px-4 py-2 text-white'
                >
                  Reset
                </button>
                <button
                  type='submit'
                  className='w-1/2 rounded-md bg-blue-600 px-4 py-2 text-white'
                >
                  Submit
                </button>
              </div>
            </form>
          </FormProvider>
        </section>
        <RegisterFooter />
      </main>
    </>
  );
};

export default Register;
