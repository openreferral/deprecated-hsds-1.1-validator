# Open Referral - Validator microservice



## Running locally

In order to run the project you need to have the latest [NodeJS](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/) installed.

Once your environment is all set up, clone the repository, go into the root directory and install all dependencies by running

```
$ npm install
```
Once all the dependencies have been downloaded, run the application with

```
$ npm start
```

This will launch the NodeJS application and it will be available at http://localhost:8080 in your browser.


## Running as a Docker container

You need to have [Docker](https://www.docker.com/) service installed on your local machine or any other target host.

Once Docker is installed, fetch the latest image from the [Docker Hub](https://hub.docker.com/r/openreferral/playground/) registry

```
$ docker pull openreferral/playground
```

Then fire up a Docker container instance by entering

```
$ docker run -d -p 8080:8080 --net=host --name="playground" openreferral/playground

```

You can use any name you want, by replacing the **"playground"** value with one of your choice.  The container will bind the **8080** port by default so if you want to change it to a different port - e.g. 9090 - replace _8080:8080_ with **9090**:8080.

Once the container is launched, you can stop it and start / restart it on demand like so

```
$ docker stop playground
$ docker restart playground
```
