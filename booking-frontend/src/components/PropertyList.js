import React, { useState, useEffect } from 'react';

function PropertyList() {
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        // Fetch properties from your REST API
        fetch('http://localhost:3001/api/properties')
            .then(response => response.json())
            .then(data => setProperties(data))
            .catch(error => console.error('Error fetching properties:', error));
    }, []);

    return (
        <div>
            <h2>Properties</h2>
            <ul>
                {properties.map(property => (
                    <li key={property.id}>{property.name}</li>
                ))}
            </ul>
        </div>
    );
}

export default PropertyList;
