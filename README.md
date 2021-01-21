This BetterDiscord plugin will set your statuses and mute channels when certain processes run.
NOTE: Linux support is patchy at the moment

## <u>Preview</u>

<a href = "https://youtu.be/NqZqJjjnrvQ">Video of the plug-in in action</a>

<u>Settings panel preview</u>

<a href="https://cdn.discordapp.com/attachments/660950914202599427/801773041511956521/targets.PNG">Target selection</a>

<a href="https://cdn.discordapp.com/attachments/660950914202599427/801773038794047508/statuses.PNG">Status selection</a>

<a href="https://cdn.discordapp.com/attachments/660950914202599427/801773036167888896/custom.png">Custom target selection</a>

<a href="https://cdn.discordapp.com/attachments/660950914202599427/801773033928261693/mute.PNG">Channel mute selection</a>

## <u>Installation</u>

Go to <a href = "https://raw.githubusercontent.com/SMC242/CodingDND/stable/CodingDND.plugin.js">this page</a>, hit CTRL + S, then save it in your BetterDiscord plug-ins folder. Then go to <span style = "color: #FF00FF;">Settings --> Plugins --> CodingDND --> Settings</span> to customise the plug-in.

## <u>Usage</u>

Most of the action happens inside the settings menu.

### Setting targets

- Go to `Target Processes`
- Click the buttons of the processes you want the plug-in to activate from

### Setting statuses

- Go to `Statuses`
- The active status will be set when a target is running
- The inactive status will be set when no targets are running

### Setting non-default targets

- Go to `Custom Targets
- Type the name of the program you wish to target
  - You'll need to write the name of the executable without its extension
- Click the result
- Go to `Target Processes` and enable the newly added process

### Setting channels to be muted

- Right click a channel
- Press the `Add to mute channels menu` button
- Go to `Mute Channels`
- Click the buttons for any channels you want to be muted when targets are running

## <u>Development Plan</u>

### Iteration 1

Support a list of IDEs (Atom, VSCode, IntelliJ IDEA, Eclipse, Visual Studio, Pycharm)
<b>Done</b>

### Iteration 2

Support custom process names so users can add other IDEs or even non-IDEs
<b>Done</b>

### Iteration 3

Allow different statuses from DND and online
<b>Done</b>

### Iteration 4

Mute certain channels when the processes run
<b>Done</b>

### Iteration 5

Improve linux support

## <u>Contributing</u>

Feel free to open issues for suggestions/bug reports or go to my support discord. You're more than welcome to submit pull requests too.
