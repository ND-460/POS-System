import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Typography, Spin, message, Row, Col } from "antd";
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
        const { data } = await axios.get("api/users/qr-login-url");
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
    window.location.href = "/api/users/auth/google";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Card
        style={{
          maxWidth: 400,
          width: "100%",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          padding: 24,
          background: "#fff",
        }}
      >
        <Row justify="center" align="middle">
          <Col span={24}>
            <Title level={2} style={{ color: "#1890ff", textAlign: "center", marginBottom: 24 }}>
              Customer Login
            </Title>
          </Col>

          {/* - QR Code Login */}
          <Col span={24} style={{ textAlign: "center", marginBottom: 24 }}>
            <Title level={4} style={{ color: "#333", marginBottom: 16 }}>
              Scan to Login
            </Title>
            {qrCodeUrl ? (
              <QRCode value={qrCodeUrl} size={200} />
            ) : (
              <Spin size="large" />
            )}
            <Text type="secondary" style={{ display: "block", marginTop: 16 }}>
              Use your phone to scan and login.
            </Text>
          </Col>

          {/* - Google Sign-In */}
          <Col span={24} style={{ textAlign: "center", marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<GoogleOutlined />}
              size="large"
              style={{
                background: "#1890ff",
                borderColor: "#1890ff",
                color: "#fff",
                width: "100%",
                borderRadius: 8,
              }}
              onClick={handleGoogleSignIn}
            >
              Sign in with Google
            </Button>
          </Col>

          {/* - Navigate Back */}
          <Col span={24} style={{ textAlign: "center" }}>
            <Button
              icon={<QrcodeOutlined />}
              size="large"
              style={{
                background: "#e6f7ff",
                borderColor: "#e6f7ff",
                color: "#1890ff",
                width: "100%",
                borderRadius: 8,
              }}
              onClick={() => navigate("/login")}
            >
              Back to Main Login
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CustomerLogin;
