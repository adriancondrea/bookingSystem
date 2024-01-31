import React, { useState, useEffect } from 'react';

function NotificationBar() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:3002/notifications');

        ws.onmessage = event => {
            setNotifications(notifs => [...notifs, event.data]);
        };

        return () => ws.close();
    }, []);

    return (
        <div>
            <h2>Notifications</h2>
            <ul>
                {notifications.map((notif, index) => (
                    <li key={index}>{notif}</li>
                ))}
            </ul>
        </div>
    );
}

export default NotificationBar;
