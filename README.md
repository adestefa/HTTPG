HTTP!
A simple game with HTTP status response codes




<a href="http://172.104.210.69:3000/"><img src="static/imgs/game.png" width="400px"></a>

<a href="http://172.104.210.69:3000/">Play HTTP! Now</a>

BUILD (Local Machine)
-----------------------
1. build server.go binary for linux server
>sh build_linux.sh

2. it should call sh scp.sh to upload to linode
>sh scp.sh
>(Passwrd: Lkey)

3. Files will upload to /tmp/ directory on server

INSTALL (On server)
-------------------------
1. Connect to Linode box
> z go linode
(Passwrd: Lkey)

2. Go to temp
> cd /
> cd /tmp

3. inspect HTTP_ dir
> cd HTTP_
> cd scripts

4. Uninstall service and install new one
> sh build_service.sh

5. This will auto run install service
> sh install_service.sh

6. The service file will be copied to systemd and installed as deamon