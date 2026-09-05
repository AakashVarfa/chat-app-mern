import { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const handleVerify = async (e) => {
    e.preventDefault();

    // Check whether email exists
    if (!email) {
      toast.error("Email information is missing. Please signup again.");
      navigate("/signup");
      return;
    }

    // Check OTP
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || ""}/api/user/verify-email`,
        {
          email: email,
          otp: otp,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast.success("Email verified successfully!");

        // Go to login after successful verification
        navigate("/login");
      }
    } catch (error) {
      console.error("Email verification error:", error);

      toast.error(
        error.response?.data?.error ||
          "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-white">

      {/* ================= VERIFICATION CARD ================= */}

      <form
        onSubmit={handleVerify}
        className="border border-black px-6 py-4 rounded-md space-y-4 w-96"
      >

        {/* ================= HEADING ================= */}

        <h1 className="text-2xl text-blue-600 font-bold">
          Messenger
        </h1>

        <h2 className="text-2xl">
          Verify your{" "}
          <span className="text-blue-600 font-semibold">
            Email
          </span>
        </h2>

        {/* ================= DESCRIPTION ================= */}

        <p className="text-gray-600 text-sm leading-5">
          We have sent a 6-digit verification OTP to:
        </p>

        <p className="font-semibold text-gray-800 break-all">
          {email}
        </p>

        {/* ================= OTP INPUT ================= */}

        <label className="input input-bordered flex items-center gap-2">

          {/* Mail Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-4 h-4 opacity-70"
          >
            <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />

            <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
          </svg>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            className="grow text-center tracking-[8px] font-semibold"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => {
              const value = e.target.value
                .replace(/\D/g, "")
                .slice(0, 6);

              setOtp(value);
            }}
          />

        </label>

        {/* ================= OTP INFO ================= */}

        <p className="text-xs text-gray-500 text-center">
          OTP is valid for 10 minutes.
        </p>

        {/* ================= VERIFY BUTTON ================= */}

        <div className="flex justify-center">

          <input
            type="submit"
            value={loading ? "Verifying..." : "Verify Email"}
            disabled={loading}
            className={`text-white bg-blue-600 cursor-pointer w-full rounded-lg py-2 ${
              loading
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          />

        </div>

        {/* ================= BACK TO SIGNUP ================= */}

        <p className="text-sm">
          Didn't receive the OTP?{" "}

          <Link
            to="/signup"
            className="text-blue-500 underline cursor-pointer ml-1"
          >
            Signup again
          </Link>
        </p>

      </form>
    </div>
  );
};

export default VerifyEmail;