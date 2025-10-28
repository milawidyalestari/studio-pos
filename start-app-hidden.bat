@echo off
REM Create VBScript to hide console window
echo Set WshShell = CreateObject("WScript.Shell") > temp.vbs
echo WshShell.Run "npx electron .", 0 >> temp.vbs
REM Run the VBScript
cscript //nologo temp.vbs
REM Clean up
del temp.vbs
