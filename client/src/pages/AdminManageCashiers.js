import React, { useEffect, useState } from "react";
import { Table, Button, Input, message, Modal, Form, Select } from "antd";

import axios from "axios";

const { Option } = Select;

const AdminManageCashiers = () => {
  const [cashiers, setCashiers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCashier, setEditingCashier] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCashiers();
  }, []);

  // -Fetch Cashiers
  const loadCashiers = async () => {
    try {
      const { data } = await axios.get("http://localhost:8080/api/users/cashiers");
      setCashiers(data);
    } catch (error) {
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
    setIsModalOpen(true);
    setEditingCashier(cashier._id);
  
    setTimeout(() => {
      form.setFieldsValue(cashier);
      console.log("-Form Fields Set:", cashier); // -Check if form values update
    }, 0);
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
          role: "cashier",
        });
        message.success("Cashier added successfully!");
        setCashiers((prevCashiers) => [...prevCashiers, data]);
      }

      setIsModalOpen(false);
      setEditingCashier(null);
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || "Error saving cashier");
    }
  };

  return (
    <div>
      <h2>Manage Cashiers</h2>
      <Button type="primary" onClick={handleAddCashier}>Add Cashier</Button>

      <Table
        dataSource={cashiers}
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
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Option value="cashier">Cashier</Option>
              <Option value="admin">Admin</Option> {/* -Allow role change */}
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
