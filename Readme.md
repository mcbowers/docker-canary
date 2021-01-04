# Docker Canary

## Description
The Docker Canary is a sample application that runs an express server that responds with basic information on the request events and context, environment, and checks of basic services.

## Building/Test/Deploying
### Building
The container can be built by running ```npm run build```.   This will build the container and make it available to the local environment.

### Deploying
To deploy into a local kubernetes environment first insure that a local repository is running by typing ```docker ps |grep registry```.   If necessary a local repo can be created by running ```docker run -d -p 5000:5000 --restart=always --name registry registry:2```

Next, push the local repo to the private repository by running ```npm run push```.    Once the container has been pushed run ```npm run deploy``` to create the necessary Kubernetes deployment and services.

Once the deployment is complete the service can be accessed from https://localhost:8065.
### Testing
The container can be run locally by running ```npm run start```.   This will cause the container to run locally on port 8065.   To test the service you can type ```curl localhost:8065```.