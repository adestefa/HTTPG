# Run this first after uploading to server
# this will shut down the current service
# move the directories
# then start the new service


echo "Building Go Service.."
echo "1. Uninstalling current service..."
sh uninstall_service.sh
echo "2. Move current HTTP_ dir to last.."
cd /
mv HTTP_ HTTP_last
echo "3. Move HTTP from temp to root.."
cd tmp
mv HTTP_ /
cd /
echo "4. Install new HTTP_ service demon..."
cd HTTP_
cd scripts
sh install_service.sh