#r "paket:
nuget Fake.Core.Target
nuget Fake.DotNet.Cli
nuget Fake.JavaScript.Npm
nuget Fake.IO.FileSystem //"

#load ".fake/build.fsx/intellisense.fsx"

open Fake.Core
open Fake.DotNet
open Fake.IO
open Fake.IO.Globbing.Operators
open Fake.Core.TargetOperators
open Fake.JavaScript
open Fake.DotNet

Target.create "Clean" (fun _ ->
    !! "**/bin"
    ++ "**/obj"
    ++ "**/dist"
    |> Shell.cleanDirs
)

Target.create "Publish" (fun _ ->
    let publishParams (o: DotNet.PublishOptions) =
        { o with
            Configuration = DotNet.BuildConfiguration.Release
        }

    DotNet.publish publishParams "Web/Web.csproj"
)

Target.create "Build.Backend" (fun _ ->

    let buildParams (o: DotNet.BuildOptions) =
        { o with
            Configuration = DotNet.BuildConfiguration.Release
        }

    DotNet.build buildParams "Web/Web.csproj"
)

Target.create "Build.Frontend" (fun _ ->
    Npm.install (fun o ->
        { o with
            WorkingDirectory = "./Web/"
        })

    Npm.run "build" (fun o ->
        { o with
            WorkingDirectory = "./Web/"
        })
)

Target.create "All" ignore

"Clean"
  ==> "Build.Frontend"
  ==> "Build.Backend"
  ==> "Publish"
  ==> "All"

Target.runOrDefault "All"
