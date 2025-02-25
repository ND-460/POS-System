import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Form, Input, Button, DatePicker, message } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CustomerAuth.css"; // Custom styles

const CustomerAuth = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("qr") === "true") {
      console.log("📌 QR Login Detected! Setting Login Mode");
      setIsRegister(false);
    }
  }, []);

  // Handle Login/Register Submission
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (isRegister && values.birthdate) {
        values.birthdate = values.birthdate.format("YYYY-MM-DD"); // ✅ Convert date before sending
      }
  
      console.log("📌 Sending Registration Data:", values); // ✅ Debugging
  
      const endpoint = isRegister ? "/api/users/register" : "/api/users/login";
      const { data } = await axios.post(endpoint, values);
  
      message.success(`${isRegister ? "Registration" : "Login"} successful!`);
  
      dispatch({ type: "LOGIN_SUCCESS", payload: data.user });
  
      setTimeout(() => {
        navigate("/customer");
      }, 500);
    } catch (error) {
      message.error(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };
  
  

  // Handle Google Sign-In
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/api/users/auth/google";
  };

  // ✅ After successful login, update user data from local storage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("auth"));
    if (storedUser?.role === "customer") {
      console.log("✅ Google Login Detected! Redirecting to Customer Dashboard...");
      navigate("/customer");
    }
  }, []);

  return (
    <div className="customer-auth-container">
      <div className="auth-card">
        <h2>{isRegister ? "Register as a Customer" : "Customer Login"}</h2>

        <Form layout="vertical" onFinish={handleSubmit}>
          {isRegister && (
            <>
              <Form.Item name="name" label="Full Name" rules={[{ required: true, message: "Please enter your name" }]}>
                <Input placeholder="John Doe" />
              </Form.Item>

              <Form.Item name="mobile" label="Mobile Number" rules={[{ required: true, message: "Please enter your mobile number" }]}>
                <Input placeholder="+1234567890" />
              </Form.Item>

              <Form.Item name="birthdate" label="Birthdate" rules={[{ required: true, message: "Please select your birthdate" }]}>
  <DatePicker
    style={{ width: "100%" }}
    onChange={(date) => form.setFieldsValue({ birthdate: date })}
    format="YYYY-MM-DD"
  />
</Form.Item>


            </>
          )}

          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Enter a valid email" }]}>
            <Input placeholder="example@email.com" />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={[{ required: true, message: "Enter your password" }]}>
            <Input.Password placeholder="********" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            {isRegister ? "Register" : "Login"}
          </Button>

          <div className="or-divider">OR</div>

          {/* Google Sign-In Button */}
          <Button icon={<GoogleOutlined />} className="google-btn" onClick={handleGoogleLogin} block>
            Continue with Google
          </Button>
        </Form>

        <p className="toggle-text" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Already have an account? Login" : "New here? Register now"}
        </p>
      </div>
    </div>
  );
};

export default CustomerAuth;
