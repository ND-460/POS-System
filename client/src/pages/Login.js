import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message, Form, Input, Button, Card, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import "../styles/Login.css"; // -Import custom styles

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:8080/api/users/login", values);
      dispatch({ type: "LOGIN_SUCCESS", payload: data });
      message.success("Login successful!");

      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "cashier") {
        navigate("/cashier");
      }
    } catch (error) {
      message.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Title level={2} className="login-title">Welcome to POS</Title>
        <Form onFinish={handleLogin} layout="vertical">
          <Form.Item name="email" rules={[{ required: true, message: "Enter your email" }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Enter your password" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Button type="primary" block htmlType="submit" loading={loading} className="login-button">
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
