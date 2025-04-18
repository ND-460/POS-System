import React from "react";
import { Button, Card, Collapse } from "antd";
import { Link } from "react-router-dom";
import "../styles/CustomerHome.css"; // Custom styles
import fastTransactionImg from "../images/fast-transaction.png";
import securePaymentImg from "../images/secure-payment.png";
import inventoryImg from "../images/inventory.png";
import customerImg from "../images/customer.jpeg";
import cashierImg from "../images/cashier.jpeg";
import adminImg from "../images/admin.jpeg";

const { Panel } = Collapse;

const CustomerHome = () => {
  return (
    <div className="homepage">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo">POS System</div>
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          {/* <li><a href="#products">Products</a></li> */}
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#features">Features</a></li>
          <li>
            <Link to="/customer-auth">
              <Button type="primary">Sign In / Register</Button>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Hero Section with Background Video */}
<section id="home" className="hero-section">
<video autoPlay loop muted playsInline className="hero-video">
    <source src="" type="video/mp4" />
    Your browser does not support the video tag.
  </video>

  {/* Content Overlay */}
  <div className="hero-overlay">
    <h1>Welcome to Our POS System</h1>
    <p>Seamlessly manage your transactions with ease.</p>
    <Link to="/customer-auth">
      <Button type="primary" size="large">Get Started</Button>
    </Link>
  </div>
</section>



      {/* Features Section */}
      <section id="features" className="features-section">
        <h2>Why Choose Our POS System?</h2>
        <div className="features-grid">
          <Card className="feature-card" title="Fast Transactions" bordered>
            <img src={fastTransactionImg} alt="Fast Transactions" className="feature-img"/>
            <p>Quick and seamless checkout experience.</p>
          </Card>
          <Card className="feature-card" title="Secure Payments" bordered>
            <img src={securePaymentImg} alt="Secure Payments" className="feature-img"/>
            <p>Multiple secure payment methods supported.</p>
          </Card>
          <Card className="feature-card" title="Easy Inventory Management" bordered>
            <img src={inventoryImg} alt="Inventory Management" className="feature-img"/>
            <p>Real-time inventory tracking for admins.</p>
          </Card>
        </div>
      </section>

      {/* POS System Guide */}
      <section className="pos-guide">
        <h2>How It Works?</h2>
        <div className="guide-grid">
          <Card className="guide-card" title="For Customers" bordered>
            <img src={customerImg} alt="Customer Guide" className="guide-img"/>
            <p>Scan items, earn loyalty points, and enjoy discounts.</p>
          </Card>
          <Card className="guide-card" title="For Cashiers" bordered>
            <img src={cashierImg} alt="Cashier Guide" className="guide-img"/>
            <p>Process transactions quickly and efficiently.</p>
          </Card>
          <Card className="guide-card" title="For Admins" bordered>
            <img src={adminImg} alt="Admin Guide" className="guide-img"/>
            <p>Manage inventory, track revenue, and oversee cashiers.</p>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
<section id="faq" className="faq-section">
  <h2>Frequently Asked Questions</h2>
  <div className="faq-container">
    <Collapse accordion>
      <Panel header="How do I register?" key="1">
        <p className="faq-text">Click on the "Sign In / Register" button to create an account.</p>
      </Panel>
      <Panel header="What payment methods are supported?" key="2">
        <p className="faq-text">We support cash, UPI, credit/debit cards, and loyalty points.</p>
      </Panel>
      <Panel header="Can I earn loyalty points?" key="3">
        <p className="faq-text">Yes! Customers earn points with every purchase and can redeem them for discounts.</p>
      </Panel>
      <Panel header="Is my payment information secure?" key="4">
        <p className="faq-text">Yes, we use encrypted transactions and multiple layers of security.</p>
      </Panel>
    </Collapse>
  </div>
</section>


      {/* Footer */}
      <footer className="footer">
        <h2>Contact Us</h2>
        <p>Email: support@pos-system.com</p>
        <p>Phone: +91 1234567890</p>
      </footer>
    </div>
  );
};

export default CustomerHome;