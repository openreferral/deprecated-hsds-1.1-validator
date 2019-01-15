# Open Referral - Validator microservice

A micro-service with a **RESTful API** for validating data packages and resources using the official [Human Services Data Specification](https://openreferral.readthedocs.io/en/latest/hsds/) from [Open Referral](https://openreferral.org/).  

# Running the service

## Running as a Docker container

You need to have [Docker](https://www.docker.com/) service installed on your local machine or any other target host.

### Pulling the image from Docker Hub

The fastest way to get started is to pull the latest pre-built image from the [Docker Hub](https://hub.docker.com/r/openreferral/playground/) registry by running:

```
$ docker pull openreferral/validator
```

### Building the image locally

Otherwise you can build the image on your local machine by running the following command within the project's directory:

```
$ docker build --tag "openreferral/validator:latest" .
```
### Running the service container

After the Docker image is available you can launch a container by running:

```
$ docker run -d --network=host --name=openreferral-validator openreferral/validator:latest
```

You can use any name you want, by replacing the **"openreferral-validator"** value with one of your choice.  The container will bind to  **localhost:1400** by default.  You can change the host and port of the container by setting the **HOST** and **PORT** environment variables like so:

```
$ docker run -d --network=host -e HOST=localhost -e PORT=1300 --name=openreferral-validator openreferral/validator:latest
```

Once the container is launched, you can stop it and start / restart it on demand like so

```
$ docker stop openreferral-validator
$ docker restart openreferral-validator
```
### Running locally with NodeJS

In order to run the project locally you need to have the latest [NodeJS](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/) installed.

Once your environment is all set up, clone the repository, go into the root directory and install all dependencies by running

```
$ npm install
```
Once all the dependencies have been downloaded, run the application with

```
$ npm start
```
