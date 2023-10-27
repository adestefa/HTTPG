echo "building server for linux target..."
GOARCH=amd64 GOOS=linux go build ../server.go
sleep 2
sh scp.sh
