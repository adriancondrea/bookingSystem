#!/bin/bash

# NGINX server URL
SERVER_URL="http://localhost/api/properties"  # Replace with your actual NGINX server URL

# Number of requests to send
REQUEST_COUNT=10

echo "Sending $REQUEST_COUNT requests to $SERVER_URL..."

for ((i=1; i<=REQUEST_COUNT; i++))
do
   echo "Request $i:"
   curl -s "$SERVER_URL"
   echo -e "\n"
done

echo "Test completed."
