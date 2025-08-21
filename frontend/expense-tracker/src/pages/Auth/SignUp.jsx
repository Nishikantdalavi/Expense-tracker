import React, { useContext, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from '../../components/layouts/AuthLayout';
import Input from '../../components/Inputs/Input';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';

import API_PATHS from './../../utils/apiPaths';
import { UserContext } from '../../context/userContext';

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState(null);
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  // --- helper: upload image (safe, uses API_PATHS if provided) ---
  const uploadImage = async (file) => {
    // if there's no upload path, throw to surface error clearly
    const uploadPath = API_PATHS?.UPLOAD?.IMAGE || "/api/v1/auth/upload-image";
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosInstance.post(uploadPath, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // expect res.data = { imageUrl: "..." } (adjust according to your backend)
    return res.data;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!fullName) {
      setError("Please enter your name");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }
    if (!password) {
      setError("Please enter a password");
      return;
    }

    setError(""); // clear previous error

    try {
      let profileImageUrl = "";

      // upload image if present (safe call)
      if (profilePic) {
        // profilePic should be a File object from your ProfilePhotoSelector
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes?.imageUrl || "";
      }

      // debug log request payload
      const payload = { fullName, email, password, profileImageUrl };
      console.log("[SignUp] sending payload:", payload);

      // use API_PATHS.AUTH.REGISTER — make sure API_PATHS.AUTH.REGISTER exists
      const registerPath = API_PATHS?.AUTH?.REGISTER || "/api/v1/auth/register";
      console.log("[SignUp] registerPath:", registerPath);

      const response = await axiosInstance.post(registerPath, payload);

      console.log("[SignUp] server response:", response?.status, response?.data);

      const { token, user } = response.data || {};

      if (token) {
        localStorage.setItem("token", token);
        if (updateUser) updateUser(user);
        navigate("/dashboard");
        return;
      }

      // If no token, surface server message if any
      const serverMsg = response?.data?.message || "Signup succeeded but no token returned.";
      setError(serverMsg);
    } catch (err) {
      // better error reporting for debugging
      console.error("[SignUp] error:", err);

      // most common: backend returned JSON message in err.response.data.message
      const serverMessage = err?.response?.data?.message;
      if (serverMessage) {
        setError(serverMessage);
        return;
      }

      // if server returned validation errors object (e.g., err.response.data.errors)
      const validationErrors = err?.response?.data?.errors;
      if (validationErrors && Array.isArray(validationErrors)) {
        setError(validationErrors.map(e => e.msg || e).join(", "));
        return;
      }

      // fallback to network or JS error
      setError(err?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-auto md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Create an Account</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Join us today by entering your details below.
        </p>

        <form onSubmit={handleSignUp} className="space-y-4">
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="Alex"
              type="text"
            />
            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="alex@example.com"
              type="text"
            />
            <div className="md:col-span-2">
              <Input
                value={password}
                onChange={({ target }) => setPassword(target.value)}
                label="Password"
                placeholder="Min 8 Characters"
                type="password"
              />
            </div>
          </div>

          {/* 🔹 Show error message here */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full text-sm font-medium text-white
                       bg-gradient-to-r from-purple-500 to-purple-700
                       p-[10px] rounded-md my-1
                       shadow-lg shadow-purple-600/30
                       hover:opacity-90 transition"
          >
            Create Account
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Already have an account?{" "}
            <Link className="font-medium text-violet-600 underline" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
