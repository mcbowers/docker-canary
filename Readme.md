# Docker Canary

## Description
The Docker Canary is a sample application used to validate docker deployments and related infrastructure elements.   The container runs an express server that responds with basic information on the request events and context, environment, and checks of basic services.

The container can be accessed via the ALB (eg. https://api.test.aptus-hub.com/docker-canary).

A diagram of the solution is shown below.

![Diagram](./diagram.png)

## Building/Test/Deploying
*Note: once the CI/CD pipeline is available the container will build and deploy automatically based on the branch (master goes to prod, test goes to test).

### Building
The container can be built by running ```npm run build```.   This will build the container and make it available to the local environment.

### Deploying
To deploy the container to test run ```npm run deploy-test``` and for production run ```npm run deploy-prod```.

*Note: In order for the deploy to be successful you will need to have an AWS CLI setup and configured to talk to the aptus-hub account.*

### Testing
The container can be run locally by running ```npm run start```.   This will cause the container to run locally on port 8065.   To test the service you can type ```curl localhost:8065```.