import React, { useEffect } from "react";
import { Form, Input, Button, Card, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import { useDispatch } from "react-redux";
import { UserOutlined, LockOutlined, IdcardOutlined } from "@ant-design/icons";
import "../styles/Register.css"; // -Import custom styles

const { Title } = Typography;

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      await axios.post("http://localhost:8080/api/users/register", values);
      message.success("Registered Successfully!");
      navigate("/login");
      dispatch({ type: "HIDE_LOADING" });
    } catch (error) {
      dispatch({ type: "HIDE_LOADING" });
      message.error("Something went wrong. Try again!");
    }
  };

  // Redirect logged-in users
  useEffect(() => {
    if (localStorage.getItem("auth")) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="register-container">
      <Card className="register-card">
        <Title level={2} className="register-title">Create an Account</Title>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true, message: "Please enter your name" }]}>
            <Input prefix={<UserOutlined />} placeholder="John Doe" />
          </Form.Item>
          <Form.Item name="userId" label="User ID" rules={[{ required: true, message: "Please enter a User ID" }]}>
            <Input prefix={<IdcardOutlined />} placeholder="Unique User ID" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: "Please enter a password" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Button type="primary" block htmlType="submit" className="register-button">
            Register
          </Button>
        </Form>
        <p className="register-login-text">
          Already have an account? <Link to="/login">Login Here</Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
