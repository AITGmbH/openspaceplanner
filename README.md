# Open Space Planner
## Introduction 
This tool allows you to plan, for example, fully packed conference days, which can contain any number of rooms, slots and so on. It offers an easy and fast handling both for the planner of the day and for the participants. Within a few clicks a new session is created, times and topic blocks are entered and the participants can register. After a topic participants can give feedback to the speaker. 

## Getting Started
After cloning the project:
1. Run ```dotnet restore``` 
2. If needed run ```npm install```
3. Add Azure Storage Credentials (_otherwise the data will be saved in a local file_)
 ```dotnet user-secrets set TableStorageAccount aitopenspacestorage```
```dotnet user-secrets set TableStorageKey KEY``` (ask the administator for getting the key)
4. If needed run ```npm install -g @angular/cli```

## Execute Application
5. Run ```npm run watch```
6. Try loading project http://localhost:5000/
7. If not working run frontend and backend paralell execute ```ng build --watch``` and ```dotnet watch run``` in a second console

## Commit Changes
Invoke ```npm run dist``` before commiting any change.

## Used Technology

**Backend**
----
ASP.NET Core Web API  
SignalR Core

**Frontend**
----
Angular  
Bulma

**Database**
----
Azure Blog Storage