import React, { useEffect, useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "./LoginSignup.css";
import { useStateContext } from "../../../context/StateContext";
import { ToastContainer, toast } from "react-toastify";
import LoadingSpinner from "../../LoadingSpinner";

const LoginSignup = () => {
  const navigate = useNavigate();
  const { login } = useStateContext();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSentMessage, setEmailSentMessage] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const BASE_URL = process.env.REACT_APP_API_URL;

  const [formData, setFormData] = useState({
    userId: "",
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (emailSentMessage) {
      toast.success(emailSentMessage);
      const timeout = setTimeout(() => setEmailSentMessage(""), 5000);
      return () => clearTimeout(timeout);
    }
  }, [emailSentMessage]);

  const validatePassword = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!password) return "";
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!hasLetter) return "Password must contain at least one letter";
    if (!hasNumber) return "Password must contain at least one number";
    if (!hasSpecialChar) return "Password must contain at least one special character";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password" && !isLogin) {
      setPasswordError(validatePassword(value));
    }
  };

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill all required fields!");
      return;
    }

    if (!isLogin) {
      if (!formData.fullName || !formData.userId || !formData.confirmPassword) {
        toast.error("Please fill all required fields!");
        return;
      }

      const passwordValidationError = validatePassword(formData.password);
      if (passwordValidationError) {
        toast.error("Please fix the password requirements before submitting!");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }
      setLoading(true); // start loading

      try {
        const response = await fetch(`${BASE_URL}api/auth/check-userid/${formData.userId}`);
        const data = await response.json();
        if (!response.ok || data.available === false) {
          toast.error(data.message || "User ID already taken");
          return;
        }
      } catch {
        toast.error("Error checking User ID uniqueness");
        return;
      }
    }

    try {
      const endpoint = isLogin ? "login" : "signup";
      const url = `${BASE_URL}api/auth/${endpoint}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === "Email not verified. Please check your inbox.") {
          setEmailSentMessage("📧 Please check your email to verify your account before logging in.");
          return;
        }
        toast.error(data.message || "Something went wrong!");
        return;
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userId", data.user.userId);
        login(data.user, data.token);

        if (data.user.role === "admin" || data.user.role === "superadmin") {
          navigate("/admin");
        } else {
          toast.success(`Welcome back, ${data.user.fullName || "User"}!`);
          navigate("/user");
        }
      } else {
        setEmailSentMessage("📧 An email has been sent to your account. Please verify your email.");
        toast.success("Signup successful! Please check your email for verification.");
        setFormData({
          fullName: "",
          userId: "",
          phone: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setPasswordError("");
      }
    } catch (error) {
      toast.error(error.message || "Login failed!");
    } finally {
      setLoading(false); // stop loading
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error("Please enter your email.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/otp-verification", { state: { email: formData.email } });
      } else {
        toast.error(data.message || "Failed to send reset instructions.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsLogin((prev) => !prev);
    setPasswordError("");
    setFormData({
      userId: "",
      fullName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className={`container ${!isLogin ? "right-panel-active" : ""}`}>
      <button className="home-btn" onClick={() => navigate("/")}>
        ← Home
      </button>

      <div className="form-container">
        <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop={true} closeOnClick pauseOnHover />

        {isLogin ? (
          <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <label className="auth-label">
              Email <span className="port">*</span>
            </label>
            <div className="input-box">
              <FaEnvelope className="auth-icon" />
              <input type="email" name="email" placeholder="Your email" required value={formData.email} onChange={handleChange} />
            </div>

            <label className="auth-label">
              Password <span className="port">*</span>
            </label>
            <div className="input-box">
              <FaLock className="auth-icon" />
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" required value={formData.password} onChange={handleChange} />
              <span className="toggle-password" onClick={togglePassword}>
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <LoadingSpinner /> : "Login"}
            </button>

            <br />
            <p>
              Don't have an account?{" "}
              <span className="toggle" onClick={handleToggle}>
                SignUp
              </span>
            </p>
            <br />
            <div className="form-extra">
              <p className="forgot-password" onClick={handleForgotPassword}>
                Forgot Password?
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2>Create Account</h2>

            <div className="input-box">
              <FaUser className="auth-icon" />
              <input type="text" name="userId" placeholder="Your User ID" required value={formData.userId} onChange={handleChange} />
            </div>
            <div className="input-box">
              <FaUser className="auth-icon" />
              <input type="text" name="fullName" placeholder="Your name" required value={formData.fullName} onChange={handleChange} />
            </div>
            <div className="input-box">
              <FaPhone className="auth-icon" />
              <input type="tel" name="phone" placeholder="Your phone number" required value={formData.phone} onChange={handleChange} />
            </div>
            <div className="input-box">
              <FaEnvelope className="auth-icon" />
              <input type="email" name="email" placeholder="Your email" required value={formData.email} onChange={handleChange} />
            </div>
            <div className="input-box">
              <FaLock className="auth-icon" />
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" required value={formData.password} onChange={handleChange} />
              <span className="toggle-password" onClick={togglePassword}>
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            {passwordError && <p style={{ color: "red", fontSize: "12px", marginTop: "5px", marginBottom: "10px" }}>{passwordError}</p>}

            <div className="input-box">
              <FaLock className="auth-icon" />
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" required value={formData.confirmPassword} onChange={handleChange} />
              <span className="toggle-password" onClick={toggleConfirmPassword}>
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <LoadingSpinner /> : "Sign up"}
            </button>

            <br />
            <div className="google-login-container">
              <GoogleOAuthProvider clientId="1037759886807-vegti9cv7recaimudjillm7cs3la9b8i.apps.googleusercontent.com">
                <GoogleLogin
                  theme="filled_blue"
                  size="large"
                  uxMode="redirect"
                  onSuccess={async (credentialResponse) => {
                    try {
                      const res = await fetch(`${BASE_URL}api/auth/google-login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token: credentialResponse.credential }),
                      });

                      const data = await res.json();

                      if (res.ok) {
                        localStorage.setItem("token", data.token);
                        localStorage.setItem("user", JSON.stringify(data.user));
                        localStorage.setItem("userId", data.user._id);

                        if (!data.user.password) {
                          if (!data.user.resetToken) {
                            toast.error("⚠ Reset token is missing. Please try logging in again.");
                            return;
                          }

                          localStorage.setItem("resetEmail", data.user.email);
                          localStorage.setItem("resetToken", data.user.resetToken);

                          toast.success(`Welcome, ${data.user.fullName || "User"}!`);
                          navigate(`/set-password?email=${data.user.email}&token=${data.user.resetToken}`);
                        } else {
                          navigate("/user");
                        }
                      } else {
                        toast.error(data.message || "Google login failed.");
                      }
                    } catch {
                      toast.error("An error occurred during Google login. Please try again.");
                    }
                  }}
                />
              </GoogleOAuthProvider>
            </div>
            <br />
            <p className="auth-footer">
              Have an account?{" "}
              <span className="toggle" onClick={handleToggle}>
                Login
              </span>
            </p>
          </form>
        )}
      </div>

      <div className="overlay-container">
        <h1 className="jobhook-logo">Refer and Earn</h1>
        <p>Your next big opportunity is one click away</p>
      </div>
    </div>
  );
};

export default LoginSignup;
