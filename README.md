# Vehicles Challenge

This repository contains the solution to the vehicles challenge. The solution is implemented using NestJS, MongoDB, and GraphQL. It also has been containerized using Docker and the development and testing environments are managed using Docker Compose.

## Data seeding

The challenge requires the db to be populated from the https://vpic.nhtsa.dot.gov/api API. It can take several minutes to seed the db retrieving all the data from the API. So this project has 2 ways of seeding the db from a local captured version of the data and from the internet using the api.

To use the local version of the data, change the docker-compose file environment variable `SEED_SOURCE` to `LOCAL_FILE` or if you want to seed the db from the API, change the environment variable to `INTERNET`.

```docker
environment:
  - SEED_SOURCE=LOCAL_FILE
```

## Running the project

Once you decide the source of the data, you can run the project using the following command:

```bash
npm run composer:watch
```

This will start the project in watch mode, so any changes you make to the code will be automatically reloaded.

## Testing

To run the tests, you can use the following command:

```bash
npm run composer:test
```

This will run the tests and generate a coverage report.

## GraphQL

The project has a GraphQL playground that you can use to test the queries and mutations. You can access it by going to `http://localhost:3000/graphql`.

### Fetch vehicle makes

The following query can be used to fetch the vehicle makes:

```graphql
query {
  getVehicleMakes(first: 10) {
    edges {
      cursor
      node {
        makeId
        makeName
        vehicleTypes {
          typeId
          typeName
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

It is paginated using a cursor and the first argument. To fetch the next page, you can use the following query:

```graphql
query {
  getVehicleMakes(first: 10, after: "cursor") {
    edges {
      cursor
      node {
        makeId
        makeName
        vehicleTypes {
          typeId
          typeName
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

where cursor is the cursor described in the pageInfo in previous query.

## MongoDB

The project uses MongoDB as the database. The database is seeded with the vehicle makes and models. The models are related to the makes using the `makeId` field.

We use mongodb because it is a NoSQL database and it is easy to work with JSON-like data. It is also easy to scale horizontally and it is a good choice for this kind of data.
