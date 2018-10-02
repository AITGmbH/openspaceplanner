SET TOOL_PATH=.fake

IF NOT EXIST "%TOOL_PATH%\fake.exe" (
  dotnet tool install fake-cli --tool-path ./%TOOL_PATH%
)


".paket/paket.exe" restore

"%TOOL_PATH%/fake.exe" run build.fsx %*