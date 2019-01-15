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

# Using the validator service

Once the service has been launched you can verify that the API is up by hitting http://localhost:1400/health.  If everything is ok you should get a blank page (or a 200 response).

## OpenAPI definition

The micro-service has an OpenAPI 2.x compliant definition that is automatically generated on startup.  You can find the OpenAPI (Swagger) definition here http://localhost:1400/swagger.  You can parse the OpenAPI definition with any popular API tool like [Swagger](https://swagger.io/tools/swagger-ui/), [Postman](https://www.getpostman.com/), etc and start interacting with the service.

## API operations

### GET /health

#### Description

Returns a 200 OK response

### GET /validate/datapackage

#### Description

Validate an HSDS data package.  The operation requires the URI of valid **datapackage.json** file to be provided as a query parameter.  The service will parse the contents of the data package and try to validate all enlisted resources.

#### Query parameters

- **uri**: A valid local or remote URI of a **datapackage.json** descriptor file - required.

#### Response

The operation returns a collection of validation results, one per resource as defined within the data package descriptor.

#### Example call

Given we have a sample datapackage.json file at http://example.com/openreferral/datapackage.json that contains a small subset of resources, we can run the following command to validate the contained resources:

```
$ curl 'http://localhost:1400/validate/datapackage?uri=http://example.com/openreferral/datapackage.json'
```

If all data resources are valid, the service will return a response like:

```
[{
  "valid": true,
  "resource": "organization"
}, {
  "valid": true,
  "resource": "program"
}]
```

In case something is wrong, the response would be something like:

```
[
    {
        "valid": true,
        "resource": "organization"
    },
    {
        "valid": false,
        "errors": [
            {
                "row": 3,
                "description": "Foreign key \"organization_id\" violation in row 3"
            }
        ],
        "resource": "program"
    }
]
```
