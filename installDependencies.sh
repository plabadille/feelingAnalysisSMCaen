#!/bin/bash
#auto install of dependencies
apt-get install mongodb

wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

nvm install node

echo "done installing dependencies mongodb, nvm, nodejs"