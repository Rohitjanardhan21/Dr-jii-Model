import React from "react";
import { Button } from "../components/Form";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className='flex-colo h-screen w-full bg-dry text-center'>
      <img
        src='/images/404.svg'
        alt='404'
        className='max-h-96 w-full object-contain'
      />
      <h1 className='mt-10 text-4xl font-bold'>Page Not Found</h1>
      <p className='my-3 text-lg text-textGray'>
        The page you are looking for does not exist or has been moved.
      </p>
      <div className='w-48'>
        <Button
          label={"Back to Home"}
          Icon={null}
          onClick={() => navigate("/")}
        />
      </div>
    </div>
  );
}

export default NotFound;
