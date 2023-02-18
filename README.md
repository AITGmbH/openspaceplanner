# Open Space Planner

[![Build Status](https://dev.azure.com/ait/AIT/_apis/build/status/Tools/OpenSpacePlanner/OpenSpacePlanner.Pipeline?branchName=master)](https://dev.azure.com/ait/AIT/_build/latest?definitionId=334&branchName=master)

## Introduction

This tool allows you to plan, for example, fully packed conference days, which can contain any number of rooms, slots and so on. It offers an easy and fast handling both for the planner of the day and for the participants. Within a few clicks a new session is created, times and topic blocks are entered and the participants can register. After a topic participants can give feedback to the speaker.

## Getting Started

After cloning the project:

1. Restore packages

```bash
cd src/WebApi && dotnet restore
cd src/Website && npm ci
```

1. Optional: Add Azure Storage Credentials (_otherwise the data will be saved in a local file_)  
    `dotnet user-secrets set TableStorageAccount <account>`  
    `dotnet user-secrets set TableStorageKey <key>`  
    `dotnet user-secrets set TableStorageContainer <container>` (_optional, otherwise the container will be named database_)

### Debugging

1. Run `cd src/Website && npm run start` to build and run the frontend
1. Run `cd src/WebApi && dotnet watch run` to build and run the backend
1. Open the website at <http://localhost:4200/>
1. Open the API at <http://localhost:8080/swagger/>

### Creating API in frontend

The backend is exposing the API and models through OpenAPI. The frontend can automatically generate Angular services and TypeScript classes for those:

```bash
cd src/Website && npm run generate-openapi
```

## Gitpod

You can also open the solution in Gitpod: [https://gitpod.io/#/github.com/aitgmbh/openspaceplanner/](https://gitpod.io/#/github.com/aitgmbh/openspaceplanner/).
The link to open the open space planner will be printed in the Backend terminal. You can also open the Remote Explorer in the menu on the left side to see the open ports. Click on the browser icon next to port 5000 to open the website.
