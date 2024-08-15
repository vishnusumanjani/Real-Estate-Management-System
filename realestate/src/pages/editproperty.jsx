import React, { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Select, message, Upload, DatePicker, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadOutlined } from '@ant-design/icons';
import '../style/addproperty.scss';
import moment from 'moment';  // Import moment for date handling

const { TextArea } = Input;

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

const validateMessages = {
  required: '${label} is required!',
};

const EditPropertyForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [fileList, setFileList] = useState([]); // Manage fileList state

  useEffect(() => {
    axios.get(`http://localhost:8080/api/properties/${propertyId}`)
      .then(response => {
        const data = response.data;
        data.closingDate = moment(data.closingDate); // Convert date to moment object
        form.setFieldsValue(data);
        setInitialData(data);

        if (data.propertyImage) {
          setFileList([
            {
              uid: '-1',
              name: data.propertyImage,
              status: 'done',
              url: `http://localhost:8080/images/${data.propertyImage}`, // Assuming image URL is like this
            },
          ]);
        }

        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching property:', error);
        message.error('Failed to fetch property data!');
        setLoading(false);
      });
  }, [propertyId, form]);

  const handleFinish = async (values) => {
    const formData = new FormData();
    formData.append('property_name', values.propertyName);
    formData.append('property_type', values.propertyType);
    formData.append('address', values.address);
    formData.append('price', values.price);
    formData.append('occupancy_status', values.occupancyStatus);
    formData.append('closing_date', values.closingDate.format('YYYY-MM-DD')); // Ensure correct format
    formData.append('deposit_payment_terms', values.depositPaymentTerms);
    formData.append('description', values.description);

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('property_image', fileList[0].originFileObj);
    }

    try {
      await axios.put(`http://localhost:8080/api/properties/edit/${propertyId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('Property updated successfully!');
      navigate('/agent-dashboard');
    } catch (error) {
      console.error('Error updating property:', error);
      message.error('Failed to update property!');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/properties/delete/${propertyId}`);
      message.success('Property deleted successfully!');
      navigate('/home');
    } catch (error) {
      console.error('Error deleting property:', error);
      message.error('Failed to delete property!');
    }
  };

  const onReset = () => {
    form.resetFields();
    setFileList([]); // Reset fileList when form is reset
  };

  const handleUploadChange = ({ fileList }) => {
    setFileList([...fileList]);  // Ensure fileList is always an array
  };

  if (loading) {
    return <Spin size="large" tip="Loading..."/>; // Ant Design spinner
  }

  return (
    <div className="add-property-form">
      <Form
        {...layout}
        form={form}
        name="property-form"
        onFinish={handleFinish}
        validateMessages={validateMessages}
        className='form-wid'
        initialValues={initialData}
      >
        <h2 className='title'>Edit Property</h2>

        {/* Form Items */}
        {/* Property Name */}
        <Form.Item
          name="propertyName"
          label="Property Name"
          rules={[{ required: true, message: 'Please select the property name!' }]}
        >
          <Select placeholder="Select a property name">
            <Select.Option value="apartment">Apartment</Select.Option>
            <Select.Option value="house">House</Select.Option>
            <Select.Option value="villa">Villa</Select.Option>
            <Select.Option value="commercial">Commercial Space</Select.Option>
          </Select>
        </Form.Item>

        {/* Property Type */}
        <Form.Item
          name="propertyType"
          label="Property Type"
          rules={[{ required: true, message: 'Please select the property type!' }]}
        >
          <Select placeholder="Select a property type">
            <Select.Option value="sale">Sale</Select.Option>
            <Select.Option value="rent">Rent</Select.Option>
          </Select>
        </Form.Item>

        {/* Address */}
        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: 'Please input the address!' }]}
        >
          <TextArea rows={4} placeholder="Enter address" />
        </Form.Item>

        {/* Price */}
        <Form.Item
          name="price"
          label="Price"
          rules={[{ required: true, message: 'Please input the price!' }]}
        >
          <InputNumber min={0} placeholder="Enter price" />
        </Form.Item>

        {/* Occupancy Status */}
        <Form.Item
          name="occupancyStatus"
          label="Occupancy Status"
          rules={[{ required: true, message: 'Please select the occupancy status!' }]}
        >
          <Select placeholder="Select occupancy status">
            <Select.Option value="occupied">Occupied</Select.Option>
            <Select.Option value="vacant">Vacant</Select.Option>
          </Select>
        </Form.Item>

        {/* Closing Date */}
        <Form.Item
          name="closingDate"
          label="Closing Date"
          rules={[{ required: true, message: 'Please select the closing date!' }]}
        >
          <DatePicker />
        </Form.Item>

        {/* Deposit/Payment */}
        <Form.Item
          name="depositPaymentTerms"
          label="Deposit/Payment"
          rules={[{ required: true, message: 'Please input deposit/payment terms!' }]}
        >
          <TextArea rows={4} placeholder="Enter deposit/payment terms" />
        </Form.Item>

        {/* Description */}
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please input the description!' }]}
        >
          <TextArea rows={15} placeholder="Enter description" />
        </Form.Item>

        {/* Property Image */}
        <Form.Item
          name="propertyImage"
          label="Property Image"
          valuePropName="fileList"
          getValueFromEvent={(e) => {
            return Array.isArray(e) ? e : e?.fileList;
          }}
          rules={[{ required: true, message: 'Please select an image!' }]}
        >
          <Upload 
            name="propertyImage" 
            listType="picture" 
            beforeUpload={() => false}
            fileList={fileList}
            onChange={handleUploadChange}
          >
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>

        {/* Buttons */}
        <Form.Item
          wrapperCol={{
            ...layout.wrapperCol,
            offset: 8,
          }}
        >
          <Button type="primary" htmlType="submit" className='blue-button'>
            Submit
          </Button>
          <Button type="default" htmlType="button" onClick={handleDelete} className='blue-button'>
            Delete
          </Button>
          <Button type="default" htmlType="button" onClick={onReset} className='blue-button'>
            Reset
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditPropertyForm;
