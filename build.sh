#!/bin/bash
branch_name='new'
pmJson='pm2.json'

if [ $1 ]
then
  branch_name=$1
  pmJson='pm2-test2.json'
fi
echo $branch_name

git fetch --all
git checkout ${branch_name}
git reset --hard origin/${branch_name}
git pull

npm config set registry https://registry.npm.taobao.org
npm i yarn -g 
yarn install

rm -rf public
mkdir public
npm run prodTest
cp ./favicon.ico public/knowledgeWiki/
mv public/knowledgeWiki/index.html server/views/index.html

pm2 startOrReload ${pmJson}
