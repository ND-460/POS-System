import React, { useEffect, useState } from "react";
import { Table, Button, Input, message, Form, InputNumber, Select } from "antd";
import axios from "axios";

const { Option } = Select;

const AdminManageItems = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadItems();
    loadCategories();
  }, []);

  // Load items from backend
  const loadItems = async () => {
    try {
      const { data } = await axios.get("http://localhost:8080/api/items");
      setItems(data);
    } catch (error) {
      message.error("Failed to load items");
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await axios.get("http://localhost:8080/api/categories");
      console.log("Categories Fetched:", data); // -Debugging Log
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to load categories");
    }
  };

  // Add or update item
  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        // Update item
        await axios.put(`http://localhost:8080/api/items/${editingItem}`, values);
        message.success("Item updated successfully!");
        setEditingItem(null);
      } else {
        // Add new item
        await axios.post("http://localhost:8080/api/items/add", values);
        message.success("Item added successfully!");
      }
      form.resetFields();
      loadItems();
    } catch (error) {
      message.error(error.response?.data?.message || "Error saving item");
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/items/${id}`);
      message.success("Item deleted successfully!");
      loadItems();
    } catch (error) {
      message.error("Error deleting item");
    }
  };

  // Set item for editing
  const handleEdit = (item) => {
    setEditingItem(item._id);
    form.setFieldsValue(item);
  };

  return (
    <div>
      <h2>Manage Items</h2>

      {/* Item Form */}
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item name="name" label="Item Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
  <Select placeholder="Select a category">
    {categories.length > 0 ? (
      categories.map((cat) => (
        <Option key={cat._id} value={cat.name}>
          {cat.name}
        </Option>
      ))
    ) : (
      <Option disabled>No Categories Found</Option>
    )}
  </Select>
</Form.Item>


        <Form.Item name="barcode" label="Barcode" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="price" label="Price" rules={[{ required: true, type: "number", min: 1 }]}>
          <InputNumber />
        </Form.Item>

        <Form.Item name="stock" label="Stock Quantity" rules={[{ required: true, type: "number", min: 1 }]}>
          <InputNumber />
        </Form.Item>

        <Form.Item name="discount" label="Discount (%)">
          <InputNumber min={0} max={100} />
        </Form.Item>

        <Button type="primary" htmlType="submit">
          {editingItem ? "Update Item" : "Add Item"}
        </Button>
      </Form>

      {/* Item List Table */}
      <Table
        dataSource={items}
        columns={[
          { title: "Name", dataIndex: "name" },
          { title: "Category", dataIndex: "category" },
          { title: "Price", dataIndex: "price" },
          { title: "Stock", dataIndex: "stock" },
          {
            title: "Action",
            render: (_, record) => (
              <>
                <Button onClick={() => handleEdit(record)}>Edit</Button>
                <Button type="danger" onClick={() => handleDelete(record._id)}>
                  Delete
                </Button>
              </>
            ),
          },
        ]}
        rowKey="_id"
      />
    </div>
  );
};

export default AdminManageItems;
