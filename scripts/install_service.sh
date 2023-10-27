echo "Installing HTTP! go service into systemd folder"
mv http_service.service /etc/systemd/system
echo "Enabling HTTP! go service..."
sudo systemctl enable http_service
echo "Starting HTTP! service..."
sudo systemctl start http_service
echo "HTTP! service should be running..."