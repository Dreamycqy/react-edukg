#!/usr/bin/env bash
npm config set registry https://registry.npm.taobao.org
npm i yarn -g 
yarn install

rm -rf public
mkdir public
npm run prod
cp ./favicon.ico public/edukg/
mv public/edukg/index.html server/views/index.html
