import React, { useEffect, useState } from "react";
import { Table, Button, Input, message, Modal, Form, Select } from "antd";

import axios from "axios";

const { Option } = Select;

const AdminManageCashiers = () => {
  const [cashiers, setCashiers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCashier, setEditingCashier] = useState(null);
  const [form] = Form.useForm();
  const [sortOption, setSortOption] = useState("name-asc");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCashiers();
  }, []);

  // -Fetch Cashiers
  const loadCashiers = async () => {
    try {
      const { data } = await axios.get("http://localhost:8080/api/users/cashiers");
      console.log("- Cashiers Loaded:", data); // Log fetched data
      setCashiers(data);
    } catch (error) {
      console.error("- Failed to load cashiers:", error.response?.data || error.message); // Log error details
      message.error("Failed to load cashiers");
    }
  };

  // -Open Modal for Adding Cashier
  const handleAddCashier = () => {
    console.log("-Add Cashier Clicked");
    setEditingCashier(null);
    form.resetFields();
  
    setTimeout(() => {
      setIsModalOpen(true); // -Ensure state updates before opening modal
      console.log("-Modal Open Forced:", isModalOpen);
    }, 100);
  };
  
  
  const handleEdit = (cashier) => {
    console.log("-Editing Cashier:", cashier);
    setEditingCashier(cashier._id);
    setIsModalOpen(true);
  
    setTimeout(() => {
      form.setFieldsValue(cashier);
      console.log("-Form Fields Set:", cashier); // -Check if form values update
    }, 100);
  };
  

  // -Save Cashier (Add or Update)
  const handleSave = async (values) => {
    try {
      if (editingCashier) {
        await axios.put(`http://localhost:8080/api/users/cashiers/${editingCashier}`, values);
        message.success("Cashier updated successfully!");
        setCashiers((prevCashiers) =>
          prevCashiers.map((cashier) =>
            cashier._id === editingCashier ? { ...cashier, ...values } : cashier
          )
        );
      } else {
        const { data } = await axios.post("http://localhost:8080/api/users/register", {
          ...values,
          role: "cashier", // Ensure role is set to cashier
        });
        message.success("Cashier added successfully!");
        setCashiers((prevCashiers) => [...prevCashiers, data]);
      }

      setIsModalOpen(false);
      setEditingCashier(null);
      loadCashiers();
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || "Error saving cashier");
    }
  };

  const handleDelete = async (cashierId) => {
    try {
      console.log(` Deleting Cashier ID: ${cashierId}`);
      await axios.delete(`http://localhost:8080/api/users/cashiers/${cashierId}`);
      message.success("Cashier deleted successfully!");
  
      //  Remove cashier from UI after deletion
      setCashiers((prevCashiers) => prevCashiers.filter((cashier) => cashier._id !== cashierId));
    } catch (error) {
      console.error(" Error deleting cashier:", error.response?.data || error.message);
      message.error(error.response?.data?.message || "Error deleting cashier");
    }
  };

  // Handle Sorting
  const handleSort = (value) => {
    setSortOption(value);
    let sortedCashiers = [...cashiers];

    if (value === "name-asc") {
      sortedCashiers.sort((a, b) => a.name.localeCompare(b.name));
    } else if (value === "name-desc") {
      sortedCashiers.sort((a, b) => b.name.localeCompare(a.name));
    }

    setCashiers(sortedCashiers);
  };

  // Filtered Cashiers
  const filteredCashiers = cashiers.filter(
    (cashier) =>
      cashier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cashier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cashier.mobile.includes(searchTerm)
  );

  return (
    <div>
      <h2>Manage Cashiers</h2>
      
      <Button type="primary" onClick={handleAddCashier} style={{ marginBottom: "20px" }}>
        Add Cashier
      </Button>
      
      {/* Sorting and Search Options */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <Select value={sortOption} onChange={handleSort} style={{ width: 200 }}>
          <Option value="name-asc">Sort: Name (A-Z)</Option>
          <Option value="name-desc">Sort: Name (Z-A)</Option>
        </Select>
        <Input
          placeholder="Search Cashiers"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 200 }}
        />
      </div>

      <Table
        dataSource={filteredCashiers}
        columns={[
          { title: "Name", dataIndex: "name" },
          { title: "Email", dataIndex: "email" },
          { title: "Mobile", dataIndex: "mobile" },
          { title: "Role", dataIndex: "role" },
          {
            title: "Actions",
            render: (_, record) => (
              <>
                <Button onClick={() => handleEdit(record)}>Edit</Button>
                <Button type="danger" onClick={() => handleDelete(record._id)}>Delete</Button>
              </>
            ),
          },
        ]}
        rowKey="_id"
      />

      {/* -Modal for Adding/Editing Cashier */}
      <Modal
  title={editingCashier ? "Edit Cashier" : "Add Cashier"}
  open={isModalOpen} // -Fix: Use `open` instead of `visible`
  onCancel={() => {
    setIsModalOpen(false);
    form.resetFields();
  }}
  footer={null}
>

        <Form form={form} onFinish={handleSave} layout="vertical">

          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="mobile" label="Mobile" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="birthdate" label="Birthdate">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Option value="cashier">Cashier</Option>
              {/* <Option value="admin">Admin</Option> -Allow role change */}
            </Select>
          </Form.Item>
          {!editingCashier && (
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Button type="primary" htmlType="submit">
            {editingCashier ? "Update Cashier" : "Add Cashier"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminManageCashiers;
