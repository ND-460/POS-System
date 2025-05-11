import React, { useState, useEffect } from "react";
import { Layout, Menu, Typography, Button, Card, Collapse, Row, Col, Divider, Image } from "antd";
import { Link } from "react-router-dom";
import {
  UserOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  AppstoreOutlined,
  SmileOutlined,
  TeamOutlined,
  SettingOutlined,
  MailOutlined,
  PhoneOutlined,
  ToolOutlined,
  LikeOutlined,
  CustomerServiceOutlined,
  ExperimentOutlined,
  AimOutlined,
} from "@ant-design/icons";
import fastTransactionImg from "../images/fast-transaction.png";
import securePaymentImg from "../images/secure-payment.png";
import inventoryImg from "../images/inventory.png";
import customerImg from "../images/customer.jpeg";
import cashierImg from "../images/cashier.jpeg";
import adminImg from "../images/admin.jpeg";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const features = [
  {
    key: "fast",
    title: "Fast Transactions",
    icon: <ThunderboltOutlined />,
    description: "Quick and seamless checkout experience with our advanced technology.",
    img: fastTransactionImg,
  },
  {
    key: "secure",
    title: "Secure Payments",
    icon: <SafetyCertificateOutlined />,
    description: "Multiple secure payment methods with end-to-end encryption.",
    img: securePaymentImg,
  },
  {
    key: "inventory",
    title: "Easy Inventory",
    icon: <AppstoreOutlined />,
    description: "Real-time inventory tracking and management for admins.",
    img: inventoryImg,
  },
];

const guides = [
  {
    key: "customer",
    title: "For Customers",
    icon: <SmileOutlined />,
    description: "Scan items, earn loyalty points, and enjoy exclusive discounts.",
    img: customerImg,
  },
  {
    key: "cashier",
    title: "For Cashiers",
    icon: <TeamOutlined />,
    description: "Process transactions quickly and efficiently with our intuitive interface.",
    img: cashierImg,
  },
  {
    key: "admin",
    title: "For Admins",
    icon: <SettingOutlined />,
    description: "Manage inventory, track revenue, and oversee cashiers with powerful tools.",
    img: adminImg,
  },
];

const highlights = [
  {
    icon: <ToolOutlined style={{ fontSize: 28 }} />,
    title: "Adaptable performance",
    description: "Our product effortlessly adjusts to your needs, boosting efficiency and simplifying your tasks.",
  },
  {
    icon: <ExperimentOutlined style={{ fontSize: 28 }} />,
    title: "Built to last",
    description: "Experience unmatched durability that goes above and beyond with lasting investment.",
  },
  {
    icon: <LikeOutlined style={{ fontSize: 28 }} />,
    title: "Great user experience",
    description: "Integrate our product into your routine with an intuitive and easy-to-use interface.",
  },
  {
    icon: <ExperimentOutlined style={{ fontSize: 28 }} />,
    title: "Innovative functionality",
    description: "Stay ahead with features that set new standards, addressing your evolving needs better than the rest.",
  },
  {
    icon: <CustomerServiceOutlined style={{ fontSize: 28 }} />,
    title: "Reliable support",
    description: "Count on our responsive customer support, offering assistance that goes beyond the purchase.",
  },
  {
    icon: <AimOutlined style={{ fontSize: 28 }} />,
    title: "Precision in every detail",
    description: "Enjoy a meticulously crafted product where small touches make a significant impact on your overall experience.",
  },
];

const CustomerHome = () => {
  const [selectedFeature, setSelectedFeature] = useState(features[0]);
  const [selectedGuide, setSelectedGuide] = useState(guides[0]);
  const [visibleSections, setVisibleSections] = useState({});

  const handleScroll = () => {
    const sections = document.querySelectorAll(".scroll-section");
    const updatedVisibility = {};
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        updatedVisibility[section.id] = true;
      }
    });
    setVisibleSections(updatedVisibility);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Navbar */}
      <Header
        style={{
          background: "#e6f7ff",
          position: "fixed",
          width: "100%",
          zIndex: 1000,
          boxShadow: "0 2px 8px #0001",
          padding: "0 16px",
          height: "auto", // Allow height to adjust based on content
        }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{
            maxWidth: 960,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Col flex="auto">
            <Typography.Title
              level={4}
              style={{
                color: "#1890ff",
                margin: 0,
                letterSpacing: 1,
                display: "flex",
                alignItems: "center",
                fontSize: "clamp(14px, 5vw, 18px)", // Automatically adjusts font size
              }}
            >
              <ThunderboltOutlined
                style={{
                  marginRight: 8,
                  fontSize: "clamp(14px, 5vw, 18px)", // Automatically adjusts icon size
                }}
              />{" "}
              POS System
            </Typography.Title>
          </Col>
          <Col flex="auto">
            <Menu
              mode="horizontal"
              theme="light"
              defaultSelectedKeys={["home"]}
              style={{
                background: "transparent",
                justifyContent: "center",
                borderBottom: "none",
                fontSize: "clamp(12px, 4vw, 14px)", // Automatically adjusts menu font size
                display: "flex",
                alignItems: "center", // Vertically center menu items
              }}
            >
              <Menu.Item key="home" icon={<AppstoreOutlined />}>
                <a href="#homes">Home</a>
              </Menu.Item>
              <Menu.Item key="features" icon={<SettingOutlined />}>
                <a href="#features">Features</a>
              </Menu.Item>
              <Menu.Item key="faq" icon={<SmileOutlined />}>
                <a href="#faq">FAQ</a>
              </Menu.Item>
            </Menu>
          </Col>
          <Col flex="none">
            <Link to="/customer-auth">
              <Button
                type="primary"
                icon={<UserOutlined />}
                size="small"
                style={{
                  background: "#1890ff",
                  color: "#fff",
                  borderColor: "#1890ff",
                  fontSize: "clamp(12px, 4vw, 14px)", // Automatically adjusts button font size
                  height: "auto", // Allow height to adjust based on content
                  padding: "0 12px", // Adjust button padding
                  display: "flex",
                  alignItems: "center", // Vertically center button content
                }}
              >
                Sign In / Register
              </Button>
            </Link>
          </Col>
        </Row>
      </Header>

      {/* Main Content */}
      <Content style={{ marginTop: 80, background: "#f0f2f5" }}>
        {/* Hero Section */}
        <div
          id="homes"
          className="scroll-section"
          style={{
            minHeight: 400,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 16px 32px 16px",
            background: "#f0f2f5",
            opacity: visibleSections.homes ? 1 : 0,
            transform: visibleSections.homes ? "translateY(0)" : "translateY(50px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <Title style={{ color: "#1890ff", fontWeight: 800, fontSize: 40, textAlign: "center", marginBottom: 16 }}>
            Welcome to <span style={{ color: "#333" }}>Our POS System</span>
          </Title>
          <Text style={{ color: "#555", fontSize: 18, marginBottom: 32, display: "block" }}>
            Seamlessly manage your transactions with ease.
          </Text>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <Link to="/customer-auth">
              <Button type="primary" size="large" icon={<UserOutlined />} style={{ background: "#1890ff", borderColor: "#1890ff" }}>Get Started</Button>
            </Link>
            {/* <Button size="large" style={{ borderColor: "#1890ff", color: "#1890ff" }} icon={<ThunderboltOutlined />}>Learn More</Button> */}
          </div>
  </div>

        <Divider style={{ margin: '0 auto', maxWidth: 800 }} />

        {/* Responsive Section */}
        <div
          id="responsive"
          className="scroll-section"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "48px 16px",
            textAlign: "center",
            opacity: visibleSections.responsive ? 1 : 0,
            transform: visibleSections.responsive ? "translateY(0)" : "translateY(50px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <Title level={2} style={{ color: "#1890ff", fontWeight: 700, marginBottom: 24 }}>
            Designed for All Devices
          </Title>
          <Text style={{ color: "#555", fontSize: "clamp(14px, 4vw, 16px)", lineHeight: 1.8, marginBottom: 24, display: "block" }}>
            Our POS system is fully responsive, ensuring a seamless experience on both mobile and desktop devices. 
            Whether you're on the go or at your desk, enjoy a consistent and intuitive interface.
          </Text>
          <Row gutter={[32, 32]} justify="center" align="middle">
            <Col xs={24} md={12}>
              <Image
                src="/media/PcMobile.jpeg" // Replace with the actual image path
                alt="Responsive Design"
                width="100%"
                style={{ objectFit: "cover", borderRadius: 16 }}
                preview={false}
              />
            </Col>
            <Col xs={24} md={12} style={{ textAlign: "left" }}>
              <Title level={4} style={{ color: "#1890ff", marginBottom: 16 }}>
                Seamless Experience
              </Title>
              <Text style={{ color: "#555", fontSize: "clamp(14px, 4vw, 16px)", lineHeight: 1.8 }}>
                Our system adapts to any screen size, providing an optimized layout for mobile users and a comprehensive view for desktop users. 
                Stay productive and efficient, no matter where you are.
              </Text>
            </Col>
          </Row>
        </div>

        <Divider style={{ margin: '0 auto', maxWidth: 800 }} />

        {/* Features Section - Two Column Layout */}
        <div
          id="features"
          className="scroll-section"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "48px 16px",
            opacity: visibleSections.features ? 1 : 0,
            transform: visibleSections.features ? "translateY(0)" : "translateY(50px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <Title level={2} style={{ color: "#1890ff", textAlign: "center", fontWeight: 700, marginBottom: 40 }}>Why Choose Our POS System?</Title>
          <Row gutter={[32, 32]} justify="center" align="middle">
            {/* Left: Selected Feature Image */}
            <Col xs={24} md={10} style={{ display: "flex", justifyContent: "center" }}>
              <Card bordered={false} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #0001", width: 350, minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image src={selectedFeature.img} alt={selectedFeature.title} width={300} height={200} style={{ objectFit: "cover", borderRadius: 12 }} preview={false} />
          </Card>
            </Col>
            {/* Right: Feature List */}
            <Col xs={24} md={14}>
              <Row gutter={[24, 24]}>
                {features.map((feature) => (
                  <Col xs={24} sm={12} key={feature.key}>
                    <Card
                      hoverable
                      bordered
                      style={{ borderRadius: 16, background: selectedFeature.key === feature.key ? "#e6f7ff" : "#fff", borderColor: selectedFeature.key === feature.key ? "#1890ff" : undefined, cursor: "pointer", minHeight: 180 }}
                      onClick={() => setSelectedFeature(feature)}
                    >
                      <Title level={4} style={{ color: "#1890ff", marginBottom: 8 }}>{feature.icon} {feature.title}</Title>
                      <Text style={{ color: "#555" }}>{feature.description}</Text>
          </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </div>

        <Divider style={{ margin: '0 auto', maxWidth: 800 }} />

        {/* Highlights Section */}
        <div
          id="highlights"
          className="scroll-section"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "48px 16px",
            opacity: visibleSections.highlights ? 1 : 0,
            transform: visibleSections.highlights ? "translateY(0)" : "translateY(50px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <Title level={2} style={{ color: "#1890ff", textAlign: "center", fontWeight: 700, marginBottom: 40 }}>
            Highlights
          </Title>
          <Row gutter={[32, 32]} justify="center" align="middle">
            {/* Highlight List */}
            <Col xs={24} md={24}>
              <Row gutter={[24, 24]}>
                {highlights.map((highlight) => (
                  <Col xs={24} sm={12} md={8} key={highlight.title}>
                    <Card
                      hoverable
                      bordered
                      style={{
                        borderRadius: 16,
                        background: "#fff",
                        borderColor: "#1890ff",
                        cursor: "pointer",
                        minHeight: 180,
                      }}
                    >
                      <Title level={4} style={{ color: "#1890ff", marginBottom: 8 }}>
                        {highlight.icon} {highlight.title}
                      </Title>
                      <Text style={{ color: "#555" }}>{highlight.description}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </div>

        <Divider style={{ margin: '0 auto', maxWidth: 800 }} />

        {/* POS System Guide - Two Column Layout */}
        <div
          id="guide"
          className="scroll-section"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "32px 16px",
            opacity: visibleSections.guide ? 1 : 0,
            transform: visibleSections.guide ? "translateY(0)" : "translateY(50px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <Title level={2} style={{ color: "#1890ff", textAlign: "center", fontWeight: 700, marginBottom: 40 }}>How It Works?</Title>
          <Row gutter={[32, 32]} justify="center" align="middle">
            {/* Left: Selected Guide Image */}
            <Col xs={24} md={10} style={{ display: "flex", justifyContent: "center" }}>
              <Card bordered={false} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #0001", width: 350, minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image src={selectedGuide.img} alt={selectedGuide.title} width={300} height={200} style={{ objectFit: "cover", borderRadius: 12 }} preview={false} />
          </Card>
            </Col>
            {/* Right: Guide List */}
            <Col xs={24} md={14}>
              <Row gutter={[24, 24]}>
                {guides.map((guide) => (
                  <Col xs={24} sm={12} key={guide.key}>
                    <Card
                      hoverable
                      bordered
                      style={{ borderRadius: 16, background: selectedGuide.key === guide.key ? "#e6f7ff" : "#fff", borderColor: selectedGuide.key === guide.key ? "#1890ff" : undefined, cursor: "pointer", minHeight: 180 }}
                      onClick={() => setSelectedGuide(guide)}
                    >
                      <Title level={4} style={{ color: "#1890ff", marginBottom: 8 }}>{guide.icon} {guide.title}</Title>
                      <Text style={{ color: "#555" }}>{guide.description}</Text>
          </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </div>

        <Divider style={{ margin: '0 auto', maxWidth: 800 }} />

      {/* FAQ Section */}
        <div
          id="faq"
          className="scroll-section"
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "32px 16px",
            opacity: visibleSections.faq ? 1 : 0,
            transform: visibleSections.faq ? "translateY(0)" : "translateY(50px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <Title level={2} style={{ color: "#1890ff", textAlign: "center", fontWeight: 700, marginBottom: 32 }}>Frequently Asked Questions</Title>
    <Collapse accordion>
      <Panel header="How do I register?" key="1">
              <Text style={{ color: "#555" }}>Click on the "Sign In / Register" button to create an account and start using our system.</Text>
      </Panel>
      <Panel header="What payment methods are supported?" key="2">
              <Text style={{ color: "#555" }}>We support cash, UPI, credit/debit cards, and loyalty points for flexible payment options.</Text>
      </Panel>
      <Panel header="Can I earn loyalty points?" key="3">
              <Text style={{ color: "#555" }}>Yes! Customers earn points with every purchase and can redeem them for exciting discounts.</Text>
      </Panel>
      <Panel header="Is my payment information secure?" key="4">
              <Text style={{ color: "#555" }}>Yes, we use encrypted transactions and multiple layers of security to protect your data.</Text>
      </Panel>
    </Collapse>
  </div>

        <Divider style={{ margin: '0 auto', maxWidth: 800 }} />
      </Content>

      {/* Footer */}
      <Footer style={{ background: "#e6f7ff", color: "#1890ff", textAlign: "center", borderTop: "1px solid #e6e6e6", marginTop: 32 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Title level={4} style={{ color: "#1890ff", marginBottom: 0 }}><MailOutlined /> Contact Us</Title>
          <div style={{ marginTop: 8 }}>
            <Text style={{ color: "#1890ff", display: "block" }}><MailOutlined /> support@pos-system.com</Text>
            <Text style={{ color: "#1890ff", display: "block" }}><PhoneOutlined /> +91 1234567890</Text>
          </div>
    </div>
      </Footer>
    </Layout>
  );
};

export default CustomerHome;