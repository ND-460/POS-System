import React, { useEffect, useState } from "react";
import { Table, Button, Input, message } from "antd";
import axios from "axios";

const AdminManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  // Load categories
  const loadCategories = async () => {
    try {
      const { data } = await axios.get("http://localhost:8080/api/categories");
      setCategories(data);
    } catch (error) {
      message.error("Failed to load categories");
    }
  };

  // Add new category
  const addCategory = async () => {
    if (!newCategory.trim()) {
      message.error("Category name cannot be empty");
      return;
    }
    try {
      await axios.post("http://localhost:8080/api/categories/add", 
        { name: newCategory.trim() }, // -Ensure correct body format
        { headers: { "Content-Type": "application/json" } } // -Ensure JSON content type
      );
      message.success("Category added successfully!");
      setNewCategory("");
      loadCategories();
    } catch (error) {
      message.error(error.response?.data?.message || "Error adding category");
    }
  };
  

  // Edit category
  const editCategory = async (id) => {
    if (!updatedName.trim()) {
      message.error("Updated category name cannot be empty");
      return;
    }
    try {
      await axios.put(`http://localhost:8080/api/categories/${id}`, { name: updatedName.trim() });
      message.success("Category updated successfully!");
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      message.error("Error updating category");
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/categories/${id}`);
      message.success("Category deleted successfully!");
      loadCategories();
    } catch (error) {
      message.error("Error deleting category");
    }
  };

  return (
    <div>
      <h2>Manage Categories</h2>

      {/* Add Category Section */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Input
          placeholder="New Category Name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <Button type="primary" onClick={addCategory}>
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <Table
        dataSource={categories}
        columns={[
          { title: "Category Name", dataIndex: "name" },
          {
            title: "Action",
            render: (_, record) => (
              <div style={{ display: "flex", gap: "10px" }}>
                {editingCategory === record._id ? (
                  <>
                    <Input
                      value={updatedName}
                      onChange={(e) => setUpdatedName(e.target.value)}
                    />
                    <Button type="primary" onClick={() => editCategory(record._id)}>
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => {
                      setEditingCategory(record._id);
                      setUpdatedName(record.name);
                    }}>
                      Edit
                    </Button>
                    <Button type="danger" onClick={() => deleteCategory(record._id)}>
                      Delete
                    </Button>
                  </>
                )}
              </div>
            ),
          },
        ]}
        rowKey="_id"
      />
    </div>
  );
};

export default AdminManageCategories;
