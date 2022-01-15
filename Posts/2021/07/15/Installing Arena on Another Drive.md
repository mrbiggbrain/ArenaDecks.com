---
pageTitle: "Installing Arena on Another Drive"
description: "A guide for moving MTGA to a second drive."
date: 2021-07-15
---

If your computer has both an SSD and Harddrive you may be running into quite a common issue with your MTG Arena installation. The installer and updater almost exclusively want to use the primary drive on the computer and install to the `C:\Program Files` folder on the computer.  However in many modern computers with SSDs this space can be limited and so users tend to reserve it for applications that need the performance offered by them.

This guide aims to help you fix this common issue with Arena using a Windows feature called a junction point to redirect the Arena folder to another location automatically and constantly without the program needing to even know about it. 

## Arena is Already Installed

If MTG Arena is already installed we will need to move the folder then create a junction point. 

I'll be using the root of the "`D:`" drive as an example. Anytime you see D:\ replace it with where you copy the MTGA folder. 

### Move the MTGA Folder

Navigate to "`C:\Program Files\Wizards of the Coast`", you should see an MTGA folder located here. You'll want to move this folder to a location you want to store the program in permanently. You can right click the MTGA folder and select "Cut" then go to the new folder and use the paste option. If you use the copy option you'll need to delete the old folder after since it can;t exist for the next step. 

### Create Junction

Now we create a junction point. We will need to launch PowerShell as an administrator to do this. If your on W10 you can right click the start menu (The 4 squared icon in the bottom left corner) and select "Windows PowerShell (Admin)". If your on an earlier version you may need to search in the start menu for "PowerShell" then right click it and choose "Run as administrator."

PowerShell should open. 

Use the below command to create the junction point and link the two folders. 

`New-Item -ItemType Junction -Path "C:\Program Files\Wizards of the Coast\MTGA" -Target "D:\MTGA"`

You should get similar output to the following:

```
Directory: C:\Program Files\Wizards of the Coast


Mode                 LastWriteTime         Length Name

----                 -------------         ------ ----

d----l         7/15/2021  12:13 PM                MTGA
```



## I have Not installed Arena Yet

If you have yet to create the MTGA folder yet you can create an empty folder where you would like to have the MTGA files live and a junction point to link the default location. 

### Create the folder

Create a new empty folder where you want the files to be stored. Take note of this folder name. For simplicity I have created a folder named "MTGA" on the root of the "`D:`" drive. 

### Create Junction

Now we create a junction point. We will need to launch PowerShell as an administrator to do this. If your on W10 you can right click the start menu (The 4 squared icon in the bottom left corner) and select "Windows PowerShell (Admin)". If your on an earlier version you may need to search in the start menu for "PowerShell" then right click it and choose "Run as administrator."

PowerShell should open. 

Use the below command to create the junction point and link the two folders. 

`New-Item -ItemType Junction -Path "C:\Program Files\Wizards of the Coast\MTGA" -Target "D:\MTGA" -force`

Note the force at the end, this will create the link even though a Wizards of the Coast folder does not exist yet. 

## Install

Then proceed to install the game as normal. You do not need to change anything from the arena defaults. It will automatically redirect files to the new location. 

