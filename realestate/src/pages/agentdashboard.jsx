import React, { useState, useEffect } from 'react';
import { Button, Table, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

const Dashboard = () => {
  const [properties, setProperties] = useState([]);
  const [deleted, setDeleted] = useState(false); // State to track deletion
  const navigate = useNavigate();
  const username = localStorage.getItem('username'); // Retrieving username from localStorage

  const headerStyle = {
    backgroundColor: '#f0f2f5',
    padding: '20px',
    textAlign: 'center',
    color: '#001529',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '24px',
    fontWeight: 'bold',
  };

  useEffect(() => {
    // Fetch properties from the API
    axios.get(`http://localhost:8080/api/properties/agent-properties/${username}`)
      .then(response => {
        const data = response.data;
        if (Array.isArray(data)) {
          setProperties(data);
        } else {
          setProperties([]);
          message.error('Unexpected data format from API.');
        }
      })
      .catch(error => {
        console.error('Failed to fetch properties:', error);
        message.error('Failed to load properties.');
      });
  }, [deleted]); // Fetch properties when 'deleted' state changes

  const handleAddProperty = () => {
    navigate('/add-property');
  };

  const handleEdit = (propertyId) => {
    navigate(`/edit-property/${propertyId}`);
  };

  const handleView = (propertyId) => {
    navigate(`/view-property/${propertyId}`);
  };

  const handleDelete = async (propertyId) => {
    try {
      await axios.delete(`http://localhost:8080/api/properties/delete/${propertyId}`);
      setDeleted(prev => !prev); // Toggle 'deleted' state to trigger refetch
      message.success('Property deleted successfully.');
    } catch (error) {
      console.error('Failed to delete property:', error);
      message.error('Failed to delete property.');
    }
  };

  const columns = [
    {
      title: 'Property Image',
      dataIndex: 'propertyImage',
      key: 'property_image',
      render: (text, record) => (
        <img 
          src={`data:image/jpeg;base64,${record.propertyImage}`} 
          alt={record.propertyName}
          style={{ width: '100px', height: 'auto', borderRadius: '8px' }} 
        />
      ),
    },
    {
      title: 'Property Name',
      dataIndex: 'propertyName',
      key: 'property_name',
    },
    {
      title: 'Property Type',
      dataIndex: 'propertyType',
      key: 'property_type',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Occupancy Status',
      dataIndex: 'occupancyStatus',
      key: 'occupancy_status',
    },
    {
      title: 'Closing Date',
      dataIndex: 'closingDate',
      key: 'closing_date',
      render: (text, record) => (
        new Date(record.closingDate).toLocaleDateString()
      ),
    },
    {
      title: 'Deposit Payment Terms',
      dataIndex: 'depositPaymentTerms',
      key: 'deposit_payment_terms',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record.propertyId)}
          >
            Edit
          </Button>
          <Button 
            type="primary"
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.propertyId)}
          >
            Delete
          </Button>
        </Space>
      ),
    }
  ];

  return (
    <div>
      <header style={headerStyle}>Welcome, {username}</header>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAddProperty}
        style={{ marginBottom: 16 }}
      >
        Add Property
      </Button>
      <Table columns={columns} dataSource={properties} rowKey="propertyId" />
    </div>
  );
};

export default Dashboard;
