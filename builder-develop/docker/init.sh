#!bin/bash

if [ -d "/home/frappe/frappe-bench/apps/frappe" ]; then
    echo "Bench already exists, skipping init"
    cd frappe-bench
    # Install Node.js dependencies if missing
    if [ ! -d "apps/frappe/node_modules" ]; then
        echo "Installing Node.js dependencies for frappe..."
        cd apps/frappe && npm install && cd ../..
    fi
    bench start
else
    echo "Creating new bench..."

    # Try to find compatible Python version (3.11 or 3.12)
    PYTHON_CMD=""
    for py in python3.11 python3.12 python3.10 python3.9 python3; do
        if command -v $py >/dev/null 2>&1; then
            PYTHON_VERSION=$($py --version 2>&1 | grep -oP '\d+\.\d+' | head -1)
            if [ ! -z "$PYTHON_VERSION" ]; then
                MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
                MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)
                if [ "$MAJOR" -eq 3 ] && [ "$MINOR" -ge 9 ] && [ "$MINOR" -le 12 ]; then
                    PYTHON_CMD=$py
                    echo "Found compatible Python: $py (version $PYTHON_VERSION)"
                    break
                fi
            fi
        fi
    done
    
    if [ -z "$PYTHON_CMD" ]; then
        echo "Warning: No compatible Python version found, using default"
    bench init --skip-redis-config-generation frappe-bench --version version-15
    else
        bench init --skip-redis-config-generation frappe-bench --version version-15 --python $PYTHON_CMD
    fi
    
    cd frappe-bench
    
    # Use containers instead of localhost
    bench set-mariadb-host mariadb
    bench set-redis-cache-host "redis://redis:6379"
    bench set-redis-queue-host "redis://redis:6379"
    bench set-redis-socketio-host "redis://redis:6379"
    
    # Remove redis, watch from Procfile
    sed -i '/redis/d' ./Procfile
    sed -i '/watch/d' ./Procfile
    
    bench get-app builder --branch develop
    
    bench new-site builder.localhost \
    --force \
    --mariadb-root-password 123 \
    --admin-password admin \
    --no-mariadb-socket
    
    bench --site builder.localhost install-app builder
    bench --site builder.localhost set-config developer_mode 1
    bench --site builder.localhost clear-cache
    bench --site builder.localhost set-config mute_emails 1
    bench use builder.localhost
    
    # Install Node.js dependencies
    echo "Installing Node.js dependencies..."
    cd apps/frappe && npm install && cd ../..
    
    bench start

fi
