import React, { useState } from "react";
import OtpInput from "react-otp-input";
import { apiSendOTP } from "../../../services/AuthServices";
import useAuth from "./../../../utils/hooks/useAuth";
import { toast } from "react-toastify";

const notify = (type = "error", message) => toast[type](message);

const mobileNumberValidator = (mobile) => {
  const numberPattern = /^[0-9]+$/;
  if (!numberPattern.test(String(mobile))) {
    return { status: false, message: "Invalid mobile number" };
  }

  if (String(mobile).length !== 10) {
    return { status: false, message: "Mobile number should be 10 digits" };
  }

  return { status: true, message: "" };
};

const Login = () => {
  const { signIn } = useAuth();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("password");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [isOTPSend, setIsOTPSend] = useState(false);

  const handleChangeMobile = (e) => {
    const { value } = e.target;
    setMobile(value);
  };

  const handleChangePassword = (e) => {
    const { value } = e.target;
    setPassword(value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (mobileNumberValidator(mobile).status !== true) {
      return notify("info", mobileNumberValidator(mobile).message);
    }
    setLoading(true);
    const value = {
      mobile,
      otp,
      password,
      type,
    };
    const response = await signIn(value);
    setLoading(false);
    if (response?.status === "failed") {
      setOtp("");
      notify("error", response.message);
    }
  };

  const handleOTPSend = async (e, otpType = "send") => {
    e.preventDefault();

    if (otpType === "resend") {
      if (!mobile) {
        return;
      }
    }

    if (mobileNumberValidator(mobile).status !== true) {
      return notify("info", mobileNumberValidator(mobile).message);
    }

    if (otpType !== "resend") setLoading(true);
    try {
      const response = await apiSendOTP({ mobile });
      setLoading(false);
      if (response?.status === 200) {
        setIsOTPSend(true);
        return notify("success", response.data.message);
      } else {
        return notify("error", response.data.message);
      }
    } catch (error) {
      setLoading(false);
      const { response } = error;
      if (response?.status !== 200) {
        notify("error", response?.data?.message || "Something went wrong");
      }
    }
  };

  const handleOnTypeChange = () => {
    setIsOTPSend(false);
    setOtp("");
    setPassword("");
    if (type === "password") {
      setType("OTP");
    } else {
      setType("password");
    }
  };

  return (
    <div className="flex justify-center items-center h-full w-full px-4">
      <div className="p-6 w-full max-w-md h-fit rounded-2xl border border-[#dbe5f4] bg-white shadow-[0_20px_40px_rgba(17,34,64,0.14)]">
        <h3 className="brand-heading text-center mb-2 font-semibold text-2xl text-[#183c69]">
          Welcome to <span className="text-[#1f6feb]">Kartika Associates</span>
        </h3>
        <h3 className="text-center mb-4 font-semibold text-sm text-[#376a27] capitalize">
          {type} based login
        </h3>
        {type === "password" ? (
          <>
            <form className="v-full" onSubmit={handleFormSubmit}>
              <input
                autoFocus
                required
                placeholder="Mobile number"
                value={mobile}
                type="number"
                onChange={handleChangeMobile}
                className="w-full h-11 ps-3 pe-3 mb-3 bg-white"
              ></input>
              <input
                required
                placeholder="Password"
                value={password}
                type="password"
                onChange={handleChangePassword}
                className="w-full h-11 ps-3 pe-3 mb-4 bg-white"
              ></input>
              <button
                disabled={loading}
                className="w-full h-11 ps-2 pe-2 bg-[#1f6feb] text-center text-white font-semibold hover:bg-[#1556b9]"
                type="submit"
              >
                {loading ? "Please wait..." : "Login"}
              </button>
            </form>
          </>
        ) : type === "OTP" && !isOTPSend ? (
          <form className="v-full" onSubmit={(e) => handleOTPSend(e, "send")}>
            <input
              autoFocus
              required
              placeholder="Mobile number"
              value={mobile}
              type="number"
              onChange={handleChangeMobile}
              className="w-full h-11 ps-3 pe-3 mb-4 bg-white"
            ></input>
            <button
              disabled={loading}
              className="w-full h-11 ps-2 pe-2 bg-[#1f6feb] text-center text-white font-semibold hover:bg-[#1556b9]"
              type="submit"
            >
              {loading ? "OTP sending..." : " Send OTP"}
            </button>
          </form>
        ) : (
          <form className="w-full" onSubmit={handleFormSubmit}>
            <input
              placeholder="Mobile number"
              value={mobile}
              className="w-full h-11 ps-3 pe-3 mb-4 select-none"
            ></input>
            {isOTPSend ? (
              <OtpInput
                value={otp}
                onChange={setOtp}
                containerStyle={{
                  padding: "5px",
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
                inputStyle={{
                  padding: "7px",
                  width: "40px",
                  borderRadius: "10px",
                  border: "1px solid #c8d7ee",
                  background: "white",
                }}
                numInputs={6}
                renderSeparator={<span>-</span>}
                renderInput={(props) => <input {...props} required />}
              />
            ) : null}
            <button
              disabled={loading}
              className="w-full h-11 ps-2 pe-2 bg-[#1f6feb] text-center text-white font-semibold hover:bg-[#1556b9]"
              type="submit"
            >
              {loading ? " Please wait" : " Verify OTP"}
            </button>
          </form>
        )}
        <div
          className={`flex mt-5 ${type === "OTP" && isOTPSend ? "justify-between" : "justify-center"
            }`}
        >
          <p className="text-[#576f96]">
            Login by{" "}
            <span
              className="text-[#1f6feb] hover:underline cursor-pointer"
              onClick={handleOnTypeChange}
            >
              {type === "password" ? "OTP" : "password"}
            </span>
          </p>
          {type === "OTP" && isOTPSend ? (
            <p className="text-[#576f96]">
              <span
                className="text-[#1f6feb] hover:underline cursor-pointer"
                onClick={(e) => handleOTPSend(e, "resend")}
              >
                Resend OTP
              </span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Login;
