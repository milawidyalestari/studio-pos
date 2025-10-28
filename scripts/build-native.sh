#!/bin/bash

echo "Building Studio POS Native Application..."

echo ""
echo "Step 1: Installing dependencies..."
npm install

echo ""
echo "Step 2: Building React application..."
npm run build

echo ""
echo "Step 3: Building Electron application..."
npm run electron:build

echo ""
echo "Build completed! Check the dist-electron folder for the installer."


