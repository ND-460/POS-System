import React, { useEffect, useState } from "react";
import { Table, Button, Input, message, Form, InputNumber, Select } from "antd";
import axios from "axios";

const { Option } = Select;

const AdminManageItems = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);
  const [sortOption, setSortOption] = useState("name-asc");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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
        console.log(` Updating Item ID: ${editingItem}`);
        await axios.put(`http://localhost:8080/api/items/${editingItem}`, values);
        message.success("Item updated successfully!");
        
        //  Update the item in the state
        setItems((prevItems) =>
          prevItems.map((item) =>
            item._id === editingItem ? { ...item, ...values } : item
          )
        );
        
        setEditingItem(null);
      } else {
        console.log(" Adding New Item");
        await axios.post("http://localhost:8080/api/items/add", values);
        message.success("Item added successfully!");
      }
      
      form.resetFields();
      loadItems(); //  Reload items after update/add
    } catch (error) {
      console.error(" Error saving item:", error.response?.data || error.message);
      message.error(error.response?.data?.message || "Error saving item");
    }
  };
  

  // Delete item
  const handleDelete = async (id) => {
    try {
      console.log(` Deleting Item ID: ${id}`);
      await axios.delete(`http://localhost:8080/api/items/${id}`);
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

  return (
    <div>
      {/* Item Form */}
      <div style={{ border: "1px solid #ccc", padding: "16px", marginBottom: "16px", borderRadius: "8px" }}>
        <h2>Manage Items</h2>
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

          <Form.Item name="loyaltyPoints" label="Loyalty Points" rules={[{ required: true, type: "number", min: 0 }]}>
            <InputNumber />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            {editingItem ? "Update Item" : "Add Item"}
          </Button>
        </Form>
      </div>

      {/* Item List Table with Sorting & Filtering Options */}
      <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <Select value={sortOption} onChange={handleSort} style={{ width: 200 }}>
            <Option value="name-asc">Sort: Name (A-Z)</Option>
            <Option value="name-desc">Sort: Name (Z-A)</Option>
            <Option value="price-asc">Sort: Price (Low to High)</Option>
            <Option value="price-desc">Sort: Price (High to Low)</Option>
          </Select>
          <Select value={categoryFilter} onChange={handleFilter} style={{ width: 200 }}>
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
            style={{ width: 200 }}
          />
        </div>

        <Table
          dataSource={displayedItems}
          columns={[
            { title: "Name", dataIndex: "name" },
            { title: "Category", dataIndex: "category" },
            { title: "Price", dataIndex: "price" },
            { title: "Stock", dataIndex: "stock" },
            { title: "Loyalty Points", dataIndex: "loyaltyPoints" }, // Ensure loyalty points are displayed
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
    </div>
  );
};

export default AdminManageItems;
