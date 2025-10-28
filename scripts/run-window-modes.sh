#!/bin/bash

echo "Studio POS - Window Mode Launcher"
echo "================================"
echo ""
echo "Select window mode:"
echo "1. Standard Window (Default)"
echo "2. Transparent Window"
echo "3. Frameless Window"
echo "4. Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "Starting with Standard Window..."
        export WINDOW_TYPE=standard
        npm run electron:dev
        ;;
    2)
        echo "Starting with Transparent Window..."
        export WINDOW_TYPE=transparent
        npm run electron:dev
        ;;
    3)
        echo "Starting with Frameless Window..."
        export WINDOW_TYPE=frameless
        npm run electron:dev
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

