import React, { useEffect, useState } from "react";
import { Table, Button, Input, InputNumber, Form, DatePicker, Select, message, Row, Col, Modal } from "antd";
import axios from "axios";
import moment from "moment";
// require('dotenv').config();
const { Option } = Select;

const AdminEventAlert = () => {
  const [events, setEvents] = useState([]);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();
  const [editingEvent, setEditingEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
    loadItems();
    loadCategories();
  }, []);

  const loadEvents = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/events`);
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      message.error("Failed to load events");
    }
  };

  const loadItems = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/items`);
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
      message.error("Failed to load items");
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to load categories");
    }
  };

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
        await axios.put(`${process.env.REACT_APP_API_URL}/api/events/${editingEvent}`, payload);
        message.success("Event updated successfully!");
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event._id === editingEvent ? { ...event, ...payload } : event
          )
        );
        setEditingEvent(null);
      } else {
        const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/events`, payload);
        message.success("Event created successfully!");
        setEvents((prevEvents) => [...prevEvents, data.event]);
      }
      form.resetFields();
      setIsModalOpen(false); // Close modal after submission
    } catch (error) {
      console.error("Error saving event:", error.response?.data || error.message);
      message.error(error.response?.data?.message || "Error saving event");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/events/${id}`);
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

  const handleEdit = (event) => {
    setEditingEvent(event._id);
    setIsModalOpen(true);

    const formValues = {
      ...event,
      date: event.date ? moment(event.date) : null,
      categories: event.categories || [],
      items: event.items?.map((item) => item._id) || [],
    };

    form.setFieldsValue(formValues);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div>
      <div style={{ padding: "16px", marginBottom: "16px" }}>
        <h2>Manage Events</h2>
        <Button type="primary" onClick={handleAddEvent} style={{ marginBottom: "16px" }}>
          Add Event
        </Button>
      </div>

      <div style={{ padding: "16px" }}>
        <h2>Event List</h2>
        <Table
          dataSource={events}
          columns={[
            { title: "Title", dataIndex: "title", render: (text) => <span style={{ fontSize: "14px" }}>{text}</span> },
            { title: "Description", dataIndex: "description", render: (text) => <span style={{ fontSize: "14px" }}>{text}</span> },
            { title: "Discount (%)", dataIndex: "discount", render: (text) => <span style={{ fontSize: "14px" }}>{text}</span> },
            {
              title: "Date",
              dataIndex: "date",
              render: (text) => (
                <span style={{ fontSize: "14px" }}>
                  {text ? new Date(text).toLocaleDateString() : "N/A"}
                </span>
              ),
            },
            {
              title: "Categories",
              dataIndex: "categories",
              render: (categories) => (
                <span style={{ fontSize: "14px" }}>{categories?.join(", ") || "N/A"}</span>
              ),
            },
            {
              title: "Items",
              dataIndex: "items",
              render: (items) => <span style={{ fontSize: "14px" }}>{items?.length || "N/A"}</span>,
            },
            {
              title: "Action",
              render: (_, record) => (
                <>
                  <Button size="small" onClick={() => handleEdit(record)} style={{ fontSize: "12px" }}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    type="danger"
                    onClick={() => handleDelete(record._id)}
                    style={{ fontSize: "12px" }}
                  >
                    Delete
                  </Button>
                </>
              ),
            },
          ]}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 600 }}
          size="middle" // Adjust table size for better visibility
          style={{ fontSize: "14px" }} // Adjust overall font size
        />
      </div>

      {/* Modal for Adding/Editing Event */}
      <Modal
        title={editingEvent ? "Edit Event" : "Add Event"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
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
                    <Option key={category._id} value={category._id}>
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
                    <Option key={item._id} value={item._id}>
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
      </Modal>
    </div>
  );
};

export default AdminEventAlert;