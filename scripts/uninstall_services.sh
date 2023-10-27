#!/bin/bash

echo "Stopping go service..."
sudo systemctl stop go_service
echo "Disabling go service..."
sudo systemctl disable go_service
echo "Done."