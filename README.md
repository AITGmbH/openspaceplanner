# Open Space Planner

[![Build Status](https://dev.azure.com/ait/AIT/_apis/build/status/Tools/OpenSpacePlanner/OpenSpacePlanner.Pipeline?branchName=master)](https://dev.azure.com/ait/AIT/_build/latest?definitionId=334&branchName=master)

## Introduction

This tool allows you to plan, for example, fully packed conference days, which can contain any number of rooms, slots and so on. It offers an easy and fast handling both for the planner of the day and for the participants. Within a few clicks a new session is created, times and topic blocks are entered and the participants can register. After a topic participants can give feedback to the speaker.

## Getting Started

After cloning the project:

1. Restore packages

```bash
dotnet tool restore
dotnet paket restore
cd Web && npm ci
```

1. Optional: Add Azure Storage Credentials (_otherwise the data will be saved in a local file_)  
    `dotnet user-secrets set TableStorageAccount <account>`  
    `dotnet user-secrets set TableStorageKey <key>`  
    `dotnet user-secrets set TableStorageContainer <container>` (_optional, otherwise the container will be named database_)

### Debugging

1. Run `cd Web && npm run watch` to build and run the frontend
1. Run `cd Web && dotnet watch run` to build and run the backend (wait until the frontend is running)
1. Open the website at http://localhost:5000/

## Publishing

Run `npm run dist` to publish the project. This will produce the Angular production aot build and the ASP.NET Core release build which can then be published to a webserver. The files are located in the _bin\Release\netcoreapp3.1\publish_ folder.

## Gitpod

<<<<<<< HEAD
You can also open the solution in Gitpod: [https://gitpod.io/#/github.com/aitgmbh/openspaceplanner/](https://gitpod.io/#/github.com/aitgmbh/openspaceplanner/).
The link to open the open space planner will be printed in the Backend terminal. You can also open the Remote Explorer in the menu on the left side to see the open ports. Click on the browser icon next to port 5000 to open the website.
=======
You can also open the solution in Gitpod: [https://gitpod.io/#/github.com/aitgmbh/openspaceplanner/](https://gitpod.io/#/github.com/aitgmbh/openspaceplanner/)
>>>>>>> 2e3f1f9cb3c77812cf10081e0f3ee0679a0b6a03
