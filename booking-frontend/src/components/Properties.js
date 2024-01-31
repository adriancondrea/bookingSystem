import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Properties() {
    const [properties, setProperties] = useState([]);
    const [property, setProperty] = useState({ id: null, title: '', description: '', location: '' });
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:3002/properties');
        ws.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            if (notification.type === 'update' || notification.type === 'delete') {
                fetchProperties();
            }
        };
        fetchProperties();
        return () => ws.close();
    }, []);

    const fetchProperties = async () => {
        const response = await axios.get('/api/properties');
        setProperties(response.data);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setProperty(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (editing) {
            await axios.put(`/api/properties/${property.id}`, property);
        } else {
            await axios.post('/api/properties', property);
        }
        setProperty({ id: null, title: '', description: '', location: '' });
        setEditing(false);
        fetchProperties();
    };

    const editProperty = (property) => {
        if(!editing) {
            setProperty(property);
        }
        else {
            setProperty({ id: null, title: '', description: '', location: '' });
        }
        setEditing(!editing);
    };

    const deleteProperty = async (id) => {
        await axios.delete(`/api/properties/${id}`);
        fetchProperties();
    };

    return (
        <div>
            <h2>{editing ? "Edit Property" : "Add New Property"}</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    title:
                    <input
                        type="text"
                        name="title"
                        value={property.title}
                        onChange={handleInputChange}
                        placeholder="Property title"
                    />
                </label>
                <label>
                    Description:
                    <textarea
                        name="description"
                        value={property.description}
                        onChange={handleInputChange}
                        placeholder="Property Description"
                    />
                </label>
                <label>
                    Location:
                    <input
                        type="text"
                        name="location"
                        value={property.location}
                        onChange={handleInputChange}
                        placeholder="Property Location"
                    />
                </label>
                <button type="submit">{editing ? "Update" : "Create"}</button>
            </form>
            <h3>Properties List</h3>
            <ul>
                {properties.map((prop) => (
                    <li key={prop.id}>
                        <h4>{prop.name}</h4>
                        <p>{prop.description}</p>
                        <small>{prop.location}</small>
                        <button onClick={() => editProperty(prop)}>Edit</button>
                        <button onClick={() => deleteProperty(prop.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Properties;
