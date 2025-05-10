import React, { useEffect, useState } from "react";
import { Table, Button, Input, InputNumber, Form, DatePicker, Select, message, Row, Col } from "antd";
import axios from "axios";
import moment from "moment"; // Import moment

const { Option } = Select;

const AdminEventAlert = () => {
  const [events, setEvents] = useState([]);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
    loadItems();
    loadCategories();
  }, []);

  // Load events from backend
  const loadEvents = async () => {
    try {
      const { data } = await axios.get("/api/events");
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      message.error("Failed to load events");
    }
  };

  // Load items from backend
  const loadItems = async () => {
    try {
      const { data } = await axios.get("/api/items");
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
      message.error("Failed to load items");
    }
  };

  // Load categories from backend
  const loadCategories = async () => {
    try {
      const { data } = await axios.get("/api/categories");
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to load categories");
    }
  };

  // Add or update event
  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        discount: parseFloat(values.discount),
      };

      if (isNaN(payload.discount)) {
        message.error("Discount must be a valid number.");
        return;
      }

      if (editingEvent) {
        // Ensure the correct endpoint is used
        await axios.put(`/api/events/${editingEvent}`, payload);
        message.success("Event updated successfully!");
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event._id === editingEvent ? { ...event, ...payload } : event
          )
        );
        setEditingEvent(null);
      } else {
        const { data } = await axios.post("/api/events", payload);
        message.success("Event created successfully!");
        setEvents((prevEvents) => [...prevEvents, data.event]);
      }
      form.resetFields();
    } catch (error) {
      console.error("Error saving event:", error.response?.data || error.message);
      message.error(error.response?.data?.message || "Error saving event");
    }
  };

  // Delete event
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/events/${id}`);
      message.success("Event deleted successfully!");
      setEvents((prevEvents) => prevEvents.filter((event) => event._id !== id));
    } catch (error) {
      if (error.response?.status === 404) {
        message.error("Event not found. It may have already been deleted.");
      } else {
        console.error("Error deleting event:", error.response?.data || error.message);
        message.error(error.response?.data?.message || "Error deleting event");
      }
    }
  };

  // Set event for editing
  const handleEdit = (event) => {
    setEditingEvent(event._id);

    // Convert date to a moment object for DatePicker
    const formValues = {
      ...event,
      date: event.date ? moment(event.date) : null, // Ensure date is a moment object
      categories: event.categories || [], // Ensure categories is an array
      items: event.items?.map((item) => item._id) || [], // Map items to their IDs
    };

    form.setFieldsValue(formValues);
  };

  return (
    <div>
      {/* Event Form */}
      <div style={{ border: "1px solid #ccc", padding: "16px", marginBottom: "16px", borderRadius: "8px" }}>
        <h2>Manage Events</h2>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item name="title" label="Event Title" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="discount" label="Discount (%)" rules={[{ required: true, type: "number", min: 1 }]}>
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="date" label="Event Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="categories" label="Categories">
                <Select mode="multiple" placeholder="Select categories">
                  {categories.map((category) => (
                    <Option key={category._id} value={category._id}> {/* Use category ID */}
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="items" label="Items">
                <Select mode="multiple" placeholder="Select items">
                  {items.map((item) => (
                    <Option key={item._id} value={item._id}> {/* Use item ID */}
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit">
            {editingEvent ? "Update Event" : "Add Event"}
          </Button>
        </Form>
      </div>

      {/* Event List Table */}
      <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
        <h2>Event List</h2>
        <Table
          dataSource={events}
          columns={[
            { title: "Title", dataIndex: "title" },
            { title: "Description", dataIndex: "description" },
            { title: "Discount (%)", dataIndex: "discount" },
            {
              title: "Date",
              dataIndex: "date",
              render: (text) => (text ? new Date(text).toLocaleDateString() : "N/A"),
            },
            {
              title: "Categories",
              dataIndex: "categories",
              render: (categories) => categories?.join(", ") || "N/A",
            },
            {
              title: "Items",
              dataIndex: "items",
              render: (items) => items?.length || "N/A",
            },
            {
              title: "Action",
              render: (_, record) => (
                <>
                  <Button size="small" onClick={() => handleEdit(record)}>Edit</Button>
                  <Button size="small" type="danger" onClick={() => handleDelete(record._id)}>
                    Delete
                  </Button>
                </>
              ),
            },
          ]}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 600 }}
          size="small"
        />
      </div>
    </div>
  );
};

export default AdminEventAlert;