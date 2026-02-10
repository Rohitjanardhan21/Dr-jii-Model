import React from "react";
import { Button, Input } from "../Form";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { toast } from "react-hot-toast";

function ChangePassword() {
  return (
    <div className='flex-colo gap-4'>
      {["Old Password", "New Password", "Confirm Password"].map(
        (field, index) => (
          <Input key={index} color={true} type={"password"} label={field} />
        )
      )}
      <Button
        label={"Save Changes"}
        Icon={HiOutlineCheckCircle}
        onClick={() => {
          toast.error("This feature is not available yet");
        }}
      />
    </div>
  );
}

export default ChangePassword;
