import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Select, Row, Col, Table } from "antd";
import axios from "axios";

const { Option } = Select;

const AdminAddItem = () => {
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();

  // Load existing categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("api/categories");
        setCategories(data);
      } catch (error) {
        message.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      await axios.post("api/items/add", values);
      message.success("Item added successfully!");
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || "Error adding item");
    }
  };

  return (
    <div>
      <h2>Add New Item</h2>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item name="name" label="Item Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select>
                {categories.map((cat) => (
                  <Option key={cat._id} value={cat.name}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="barcode" label="Barcode" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="price" label="Price" rules={[{ required: true, type: "number", min: 1 }]}>
              <Input type="number" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="stock" label="Stock Quantity" rules={[{ required: true, type: "number", min: 1 }]}>
              <Input type="number" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="discount" label="Discount (%)">
              <Input type="number" min={0} max={100} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="description" label="Description">
              <Input.TextArea />
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" htmlType="submit">
          Add Item
        </Button>
      </Form>
      <Table
        dataSource={categories}
        columns={[
          { title: "Category Name", dataIndex: "name" },
          {
            title: "Action",
            render: (_, record) => (
              <div style={{ display: "flex", gap: "10px" }}>
                <Button size="small">Edit</Button>
                <Button size="small" type="danger">Delete</Button>
              </div>
            ),
          },
        ]}
        rowKey="_id"
        size="small"
      />
    </div>
  );
};

export default AdminAddItem;
