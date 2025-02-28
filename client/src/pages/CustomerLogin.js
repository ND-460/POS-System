import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Typography, Spin, message } from "antd";
import { GoogleOutlined, QrcodeOutlined } from "@ant-design/icons";
import axios from "axios";
import QRCode from "qrcode.react"; // - QR Code Generator
import "../styles/CustomerLogin.css"; // - Custom Styling

const { Title, Text } = Typography;

const CustomerLogin = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // - Fetch QR Code URL from the server
    const fetchQrCode = async () => {
      try {
        const { data } = await axios.get("http://localhost:8080/api/users/qr-login-url");
        setQrCodeUrl(data.qrUrl);
      } catch (error) {
        console.error("- Error fetching QR code:", error);
        message.error("Failed to load QR Code.");
      }
    };

    fetchQrCode();
  }, []);

  // - Google Sign-In Handler
  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:8080/api/users/auth/google";
  };

  return (
    <div className="customer-login-container">
      <Card className="login-card">
        <Title level={2} className="login-title">Customer Login</Title>

        {/* - QR Code Login */}
        <div className="qr-container">
          <Title level={4}>Scan to Login</Title>
          {qrCodeUrl ? <QRCode value={qrCodeUrl} size={200} /> : <Spin size="large" />}
          <Text type="secondary">Use your phone to scan and login.</Text>
        </div>

        {/* - Google Sign-In */}
        <Button className="google-btn" icon={<GoogleOutlined />} onClick={handleGoogleSignIn}>
          Sign in with Google
        </Button>

        {/* - Navigate Back */}
        <Button className="back-btn" icon={<QrcodeOutlined />} onClick={() => navigate("/login")}>
          Back to Main Login
        </Button>
      </Card>
    </div>
  );
};

export default CustomerLogin;
