@echo off
echo Starting Streak Blog Platform...
cd /d "%~dp0backend\streak-app"

REM Try to use Maven if available
where mvn >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using Maven to start application...
    call mvn spring-boot:run
) else (
    REM Fall back to direct Java execution
    echo Maven not found. Using direct Java execution...
    cd target
    for %%f in (*.jar) do (
        java -jar "%%f"
        goto :end
    )
    echo ERROR: No JAR file found in target directory
    echo Please build the project first with: mvn clean package
)

:end
pause

