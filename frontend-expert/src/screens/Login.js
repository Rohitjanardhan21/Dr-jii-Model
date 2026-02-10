import React, { useState } from "react";
import { Button, Input } from "../components/Form";
import { BiLogInCircle } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginWithOtp, setLoginWithOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmail = (e) => {
    setEmail(e.target.value);
    console.log("value:", e.target.value);
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = loginWithOtp
      ? { emailOrMobile: email }
      : { emailOrMobile: email, password };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/doctorlogin`,
        payload
      );
      const response2 = await fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/doctor/getAllDoctorProfile`);
      const json = await response2.json();
      const docId = await json.data.find(
        (item) => item.emailId === response.data.data.emailId
      );
      console.log("Response:", response, docId._id);
      if (response.status === 200) {
        await navigate(`/doctors/preview/${docId._id}`);
        console.log("id:", response.data.data._id, response.data.data.emailId);
        localStorage.setItem("email", response.data.data.emailId);
        localStorage.setItem("id", response.data.data._id);
      } else {
        alert("error login...");
      }
    } catch (error) {
      console.error("Login Failed:", error);
      if (error.response.data.message === "User not found") {
        // navigation.navigate("Register");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex-colo h-screen w-full bg-dry'>
      <form className='flex-colo mx-auto w-2/5 rounded-2xl bg-white p-8'>
        <img
          src='/images/logo.png'
          alt='logo'
          className='h-16 w-48 object-contain'
        />
        <div className='mb-6 flex w-full flex-col gap-4'>
          <Input
            label='Email'
            type='email'
            color={true}
            placeholder={"admin@gmail.com"}
            value={email}
            onChange={handleEmail}
          />
          <Input
            label='Password'
            type='password'
            color={true}
            placeholder={"*********"}
            value={password}
            onChange={handlePassword}
          />
        </div>
        <Button label='Log' Icon={BiLogInCircle} onClick={handleLogin} />
      </form>
    </div>
  );
}

export default Login;
