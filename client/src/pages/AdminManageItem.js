import React, { useEffect, useState } from "react";
import { Table, Button, Input, message, Form, InputNumber, Select, Modal, Row, Col } from "antd";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import Barcode from "react-barcode";

const { Option } = Select;

const AdminManageItems = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);
  const [sortOption, setSortOption] = useState("name-asc");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadItems();
    loadCategories();
  }, []);

  // Load items from backend
  const loadItems = async () => {
    try {
      const { data } = await axios.get("api/items");
      setItems(data);
    } catch (error) {
      message.error("Failed to load items");
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await axios.get("api/categories");
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
      console.log("Form Values:", values); // -Debugging Log
      if (editingItem) {
        console.log(`Updating Item ID: ${editingItem}`);
        await axios.put(`api/items/${editingItem}`, values);
        message.success("Item updated successfully!");

        // Update the item in the state
        setItems((prevItems) =>
          prevItems.map((item) =>
            item._id === editingItem ? { ...item, ...values } : item
          )
        );

        setEditingItem(null);
      } else {
        console.log("Adding New Item");
        await axios.post("api/items/add", values);
        message.success("Item added successfully!");
      }

      form.resetFields();
      setIsModalOpen(false); // Close the modal after successful submission
      loadItems(); // Reload items after update/add
    } catch (error) {
      console.error("Error saving item:", error.response?.data || error.message);
      message.error(error.response?.data?.message || "Error saving item");
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    try {
      console.log(` Deleting Item ID: ${id}`);
      await axios.delete(`api/items/${id}`);
      message.success("Item deleted successfully!");
  
      //  Remove the item from state after deletion
      setItems((prevItems) => prevItems.filter((item) => item._id !== id));
    } catch (error) {
      console.error(" Error deleting item:", error.response?.data || error.message);
      message.error(error.response?.data?.message || "Error deleting item");
    }
  };
  
  

  // Set item for editing
  const handleEdit = (item) => {
    setEditingItem(item._id);
    setIsModalOpen(true);
    form.setFieldsValue(item);
  };

  // Handle Sorting
  const handleSort = (value) => {
    setSortOption(value);
    let sortedItems = [...items];

    if (value === "name-asc") {
      sortedItems.sort((a, b) => a.name.localeCompare(b.name));
    } else if (value === "name-desc") {
      sortedItems.sort((a, b) => b.name.localeCompare(a.name));
    } else if (value === "price-asc") {
      sortedItems.sort((a, b) => a.price - b.price);
    } else if (value === "price-desc") {
      sortedItems.sort((a, b) => b.price - a.price);
    }

    setItems(sortedItems);
  };

  // Handle Filtering
  const handleFilter = (value) => {
    setCategoryFilter(value);
  };

  // Filtered and Sorted Items
  const displayedItems = items
    .filter(
      (item) =>
        (categoryFilter === "all" || item.category === categoryFilter) &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.barcode.includes(searchTerm))
    );

  const handleAddItem = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div>
      {/* Item Form */}
      <div
        style={{
          padding: "16px",
          marginBottom: "16px",
          borderRadius: "8px",
          overflowX: "auto", // Add horizontal scrolling for smaller screens
        }}
      >
        <h2>Manage Items</h2>
        <Button type="primary" onClick={handleAddItem} style={{ marginBottom: "16px" }}>
          Add Item
        </Button>
      </div>

      {/* Item List Table with Sorting & Filtering Options */}
      <div
        style={{
          padding: "16px",
          borderRadius: "8px",
          overflowX: "auto", // Add horizontal scrolling for the table
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
          <Select value={sortOption} onChange={handleSort} style={{ flex: "1 1 200px" }}>
            <Option value="name-asc">Sort: Name (A-Z)</Option>
            <Option value="name-desc">Sort: Name (Z-A)</Option>
            <Option value="price-asc">Sort: Price (Low to High)</Option>
            <Option value="price-desc">Sort: Price (High to Low)</Option>
          </Select>
          <Select value={categoryFilter} onChange={handleFilter} style={{ flex: "1 1 200px" }}>
            <Option value="all">Filter: All Categories</Option>
            {categories.map((cat) => (
              <Option key={cat._id} value={cat.name}>
                {cat.name}
              </Option>
            ))}
          </Select>
          <Input
            placeholder="Search Items"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 200px" }}
          />
        </div>

        <Table
          dataSource={displayedItems}
          columns={[
            { title: "Name", dataIndex: "name" },
            { title: "Category", dataIndex: "category" },
            { title: "Price", dataIndex: "price" },
            { title: "Stock", dataIndex: "stock" },
            { title: "Loyalty Points", dataIndex: "loyaltyPoints" },
            {
              title: "Barcode",
              dataIndex: "barcode",
              render: (text) =>
                text ? <Barcode value={text} width={1} height={50} fontSize={12} /> : "N/A",
            },
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
          scroll={{ x: 600 }} // Enable horizontal scrolling for the table
        />
      </div>

      {/* Modal for Adding/Editing Item */}
      <Modal
        title={editingItem ? "Edit Item" : "Add Item"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item name="name" label="Item Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select placeholder="Select a category">
                  {categories.map((cat) => (
                    <Option key={cat._id} value={cat.name}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="barcode" label="Barcode" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="price" label="Price" rules={[{ required: true, type: "number", min: 1 }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="stock" label="Stock Quantity" rules={[{ required: true, type: "number", min: 1 }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="lowStockAlert" label="Threshold" rules={[{ required: true, type: "number", min: 1 }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="discount" label="Discount (%)">
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="loyaltyPoints" label="Loyalty Points" rules={[{ required: true, type: "number", min: 0 }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit">
            {editingItem ? "Update Item" : "Add Item"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminManageItems;