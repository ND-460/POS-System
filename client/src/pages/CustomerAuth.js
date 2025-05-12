import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Form, Input, Button, DatePicker, message, Card, Typography, Divider } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/CustomerAuth.css"; // Custom styles

const { Title, Text } = Typography;

const CustomerAuth = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm(); // - Define form instance

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // - Detect QR Login
    if (params.get("qr") === "true") {
      console.log("- QR Login Detected! Setting Login Mode");
      setIsRegister(false);
    }

    // - Detect Google Login Success
    if (params.get("googleSuccess") === "true") {
      console.log("- Google Login Success! Fetching User Data...");
  
      axios.get(`/api/users/${params.get("userId")}`)
        .then((response) => {
          const user = response.data;
          console.log("- Google Auth User:", user);
  
          // - Save user in Redux & Local Storage
          dispatch({ type: "LOGIN_SUCCESS", payload: user });
          localStorage.setItem("auth", JSON.stringify(user));
  
          // - Redirect to Customer Dashboard
          navigate("/customer");
        })
        .catch((err) => {
          console.error("- Error Fetching User:", err);
          message.error("Google Authentication Failed!");
          navigate("/customer-auth"); // Fallback to login page
        });
    }
  
    if (params.get("error") === "GoogleAuthFailed") {
      message.error("Google Authentication Failed!");
      navigate("/customer-auth"); // Redirect to login page
    }
  }, []);

  // Handle Login/Register Submission
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (isRegister && values.birthdate) {
        values.birthdate = values.birthdate.format("YYYY-MM-DD"); // - Convert date before sending
      }
      values.role = "customer"; 
      console.log("- Sending Data:", values);

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
    const googleLoginUrl = "http://localhost:8080/api/users/auth/google"; // Ensure this matches your backend route
    console.log("- Redirecting to Google Login:", googleLoginUrl);
    window.location.href = googleLoginUrl;
  };

  return (
    <div className="customer-auth-container">
      <Card className="auth-card" bordered={false}>
        <Title level={3}>{isRegister ? "Register as a Customer" : "Customer Login"}</Title>

        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          {isRegister && (
            <>
              <Form.Item name="name" label="Full Name" rules={[{ required: true, message: "Please enter your name" }]}>
                <Input placeholder="John Doe" />
              </Form.Item>

              <Form.Item name="mobile" label="Mobile Number" rules={[{ required: true, message: "Please enter your mobile number" }]}>
                <Input placeholder="+1234567890" />
              </Form.Item>

              <Form.Item name="birthdate" label="Birthdate" rules={[{ required: true, message: "Please select your birthdate" }]}>
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
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

          <Divider>OR</Divider>

          {/* Google Sign-In Button */}
          <Button icon={<GoogleOutlined />} className="google-btn" onClick={handleGoogleLogin} block>
            Continue with Google
          </Button>
        </Form>

        <Text className="toggle-text" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Already have an account? Login" : "New here? Register now"}
        </Text>

        
        <Link to="/login" className="redirect-text toggle-text" style={{textDecoration: "none"}}>
          Not a customer?
        </Link>
      </Card>
    </div>
  );
};

export default CustomerAuth;
