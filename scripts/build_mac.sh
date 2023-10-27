echo "building server for mac target..."
GOARCH=arm64 GOOS=darwin go build ../server.go
sleep 2
echo "moving file to build.."
mv server build/
echo "running server..."
cd build
./server

