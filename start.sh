#!/bin/bash


echo " Starting Mpanolo-tsaina AI with Docker..."

if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "ating necessary directories..."
mkdir -p Backend/uploads

if [ ! -f Backend/.env ]; then
    echo "Copying environment configuration..."
    cp Backend/.env.example Backend/.env
    echo " Please edit Backend/.env with your actual configuration values"
fi

echo "🐳 Building and starting Docker containers..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d --build
else
    docker compose up -d --build
fi


echo "Waiting for services to start..."
sleep 30


echo "Checking service status..."
if command -v docker-compose &> /dev/null; then
    docker-compose ps
else
    docker compose ps
fi

echo ""
echo "Mpanolo-tsaina AI is now running!"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000"
echo " MySQL: localhost:3306"
echo "Redis: localhost:6379"
echo ""
echo "Useful commands:"
echo "  • View logs: docker-compose logs -f [service-name]"
echo "  • Stop services: docker-compose down"
echo "  • Restart services: docker-compose restart"
echo ""
echo "Remember to:"
echo "  • Update JWT_SECRET in Backend/.env"
echo "  • Configure your email settings if needed"
echo "  • Set up proper firewall rules for production"