# Open Space Planner

[![Build status](https://ait.visualstudio.com/AIT/_apis/build/status/Tools/OpenSpacePlanner/OpenSpacePlanner.CI)](https://ait.visualstudio.com/AIT/_build/latest?definitionId=288)

## Introduction

This tool allows you to plan, for example, fully packed conference days, which can contain any number of rooms, slots and so on. It offers an easy and fast handling both for the planner of the day and for the participants. Within a few clicks a new session is created, times and topic blocks are entered and the participants can register. After a topic participants can give feedback to the speaker.

## Getting Started

After cloning the project:

1.  Run `npm install`
2.  Add Azure Storage Credentials (_otherwise the data will be saved in a local file_)  
    `dotnet user-secrets set TableStorageAccount <account>`  
    `dotnet user-secrets set TableStorageKey <key>`  
    `dotnet user-secrets set TableStorageContainer <container>` (_optional, otherwise the container will be named database_)

### Debugging

1.  Run the backend first with `dotnet run watch`
2.  After the backend is built, run the frontend with `ng build --watch` (_make sure the backend is built first, otherwise you might get a 404 error_)
3.  Open the website at http://localhost:5000/

## Publishing

Run `npm run dist` to publish the project. This will produce the Angular production aot build and the ASP.NET Core release build which can then be published to a webserver. The files are located in the _bin\Release\netcoreapp2.1\publish_ folder.
