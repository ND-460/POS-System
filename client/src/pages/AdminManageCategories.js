import React, { useEffect, useState } from "react";
import { Table, Button, Input, message, Select } from "antd";
import axios from "axios";

const { Option } = Select;

const AdminManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  // Load categories
  const loadCategories = async () => {
    try {
      const { data } = await axios.get("api/categories");
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
      await axios.post("api/categories/add", 
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
      await axios.put(`api/categories/${id}`, { name: updatedName.trim() });
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
      await axios.delete(`api/categories/${id}`);
      message.success("Category deleted successfully!");
      loadCategories();
    } catch (error) {
      message.error("Error deleting category");
    }
  };

  // Handle Sorting
  const handleSort = (value) => {
    setSortOption(value);
    let sortedCategories = [...categories];

    if (value === "name-asc") {
      sortedCategories.sort((a, b) => a.name.localeCompare(b.name));
    } else if (value === "name-desc") {
      sortedCategories.sort((a, b) => b.name.localeCompare(a.name));
    }

    setCategories(sortedCategories);
  };

  // Filtered Categories
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Manage Categories</h2>

      {/* Sorting Options */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <Select value={sortOption} onChange={handleSort} style={{ width: 200 }}>
          <Option value="name-asc">Sort: Name (A-Z)</Option>
          <Option value="name-desc">Sort: Name (Z-A)</Option>
        </Select>
        <Input
          placeholder="Search Categories"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 200 }}
        />
      </div>

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
        dataSource={filteredCategories}
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
                    <Button size="small" onClick={() => {
                      setEditingCategory(record._id);
                      setUpdatedName(record.name);
                    }}>
                      Edit
                    </Button>
                    <Button size="small" type="danger" onClick={() => deleteCategory(record._id)}>
                      Delete
                    </Button>
                  </>
                )}
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

export default AdminManageCategories;
