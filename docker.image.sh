nest build
sudo docker build -t deployment-service .

sudo docker image tag deployment-service adalaws/deployment-service:latest

sudo docker image push adalaws/deployment-service:latest