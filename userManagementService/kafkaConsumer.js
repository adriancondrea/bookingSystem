const { Kafka } = require('kafkajs');
const kafka = new Kafka({ brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'user-management-group' });

async function startKafkaConsumer() {


    await consumer.connect();
    await consumer.subscribe({ topic: 'booking_events', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const bookingEvent = JSON.parse(message.value.toString());
            console.log(`Received event: ${bookingEvent.event}`);

            switch (bookingEvent.event) {
                case 'BookingCreated':
                    // Notify user about new booking
                    notifyUser(bookingEvent.data.userId, "Your booking has been created.");
                    break;
                case 'BookingUpdated':
                    // Notify user about booking update
                    notifyUser(bookingEvent.data.userId, "Your booking has been updated.");
                    break;
                case 'BookingCancelled':
                    // Notify user about booking cancellation
                    notifyUser(bookingEvent.data.userId, "Your booking has been cancelled.");
                    break;
            }
        },
    });
}

function notifyUser(userId, message) {
    console.log(`Notifying user ${userId}: ${message}`);
    // implement user notification here
}

module.exports = {startKafkaConsumer, consumer};
