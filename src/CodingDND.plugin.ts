/**
 * @name CodingDND
 * @invite AaMz4gp
 * @authorId 395598378387636234
 * @website https://github.com/SMC242/CodingDND
 * @source https://github.com/SMC242/CodingDND/blob/master/src/CodingDND.plugin.js
 */

/**
@cc_on
@if (@_jscript) 
// Offer to self-install for clueless users that try to run this directly.
var shell = WScript.CreateObject("WScript.Shell");
var fs = new ActiveXObject("Scripting.FileSystemObject");
var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
var pathSelf = WScript.ScriptFullName;
// Put the user at ease by addressing them in the first person
shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
    shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
} else if (!fs.FolderExists(pathPlugins)) {
    shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
    fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
    // Show the user where to put plugins in the future
    shell.Exec("explorer " + pathPlugins);
    shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
}
WScript.Quit();

@else@
*/

// @ts-ignore
const Bapi = BdApi;

interface settings_obj {
  tracked_items: Map<string, boolean>;
}

module.exports = (() => {
  const config = {
    info: {
      name: "CodingDND",
      authors: [
        {
          name: "[DTWM] benmitchellmtbV5",
          discord_id: "395598378387636234",
          github_username: "SMC242",
        },
      ],
      version: "0.0.0",
      description:
        "This plugin will set the Do Not Disturb status when you open an IDE. You must install `process-list` via NPM to use this plugin",
      github: "https://github.com/SMC242/CodingDND",
      github_raw:
        "https://github.com/SMC242/CodingDND/blob/master/src/CodingDND.plugin.js",
    },
    changelog: [
      { title: "New Stuff", items: ["Added more settings", "Added changelog"] },
    ],
    main: "CodingDND.js",
  };

  // @ts-ignore
  return !global.ZeresPluginLibrary
    ? class {
        _config: Object;
        constructor() {
          this._config = config;
        }
        getName() {
          return config.info.name;
        }
        getAuthor() {
          return config.info.authors.map((a) => a.name).join(", ");
        }
        getDescription() {
          return config.info.description;
        }
        getVersion() {
          return config.info.version;
        }
        load() {
          Bapi.showConfirmationModal(
            "Library Missing",
            `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
            {
              confirmText: "Download Now",
              cancelText: "Cancel",
              onConfirm: () => {
                require("request").get(
                  "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                  async (error, response, body) => {
                    if (error)
                      return require("electron").shell.openExternal(
                        "https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
                      );
                    await new Promise((r) =>
                      require("fs").writeFile(
                        require("path").join(
                          Bapi.Plugins.folder,
                          "0PluginLibrary.plugin.js"
                        ),
                        body,
                        r
                      )
                    );
                  }
                );
              },
            }
          );
        }
        start() {}
        stop() {}
      }
    : (([Plugin, Api]) => {
        const CodingDND = (Plugin, Library) => {
          const { Logger, Patcher, Settings } = Library;

          return class CodingDND extends Plugin {
            targets: Array<string>;
            running: Array<string>;
            settings: settings_obj;
            // @ts-ignore  this will get defined on_load
            snap: Function;

            constructor() {
              super();
              this.running = [];
              this.targets = [];
              this.settings = Bapi.loadData("CodingDND", "settings") ?? {
                tracked_items: new Map(),
              };
              // get the names of the processes
              this.targets = Array.from(
                this.settings.tracked_items,
                (pair) => pair[0]
              );
            }

            getName() {
              return config.info.name;
            }
            getAuthor() {
              return config.info.name;
            }
            getDescription() {
              return config.info.description;
            }
            getVersion() {
              return config.info.version;
            }

            onStart() {
              Logger.log("Started");
              Patcher.before(Logger, "log", (t, a) => {
                a[0] = "Patched Message: " + a[0];
              });
              this.loop();
            }
            onStop() {
              Logger.log("Stopped");
              Patcher.unpatchAll();
            }
            load() {
              // install process-list if not installed
              Logger.log("Getting process list");
              try {
                var { snapshot } = require("process-list");
              } catch (error) {
                // attempt to install it with npm
                Logger.log("Failed to get process list");
                const { exec } = require("child_process");
                Logger.log("Attempting to install `process-list` from NPM"); // notify user
                exec(
                  "npm install process-list",
                  { cwd: Bapi.Plugins.folder },
                  (error) => {
                    if (error) {
                      // failed to install
                      Logger.log(
                        "You must install `process-list` from NPM to use CodingDND"
                      );
                      process.exit(1);
                    } else {
                      var { snapshot } = require("process-list");
                    }
                    this.snap = async (): Promise<Array<string>> =>
                      await snapshot("name");
                    Logger.log(`Snap: ${this.snap}`);
                  }
                );
              }
            }

            getSettingsPanel() {
              return Settings.SettingPanel.build(
                this.saveSettings.bind(this),
                // this group is for selecting `targets`
                new Settings.SettingGroup("Target Processes").append(
                  ...this.button_set([
                    "Atom",
                    "Visual Studio Code",
                    "IntelliJ",
                    "Eclipse",
                    "Visual Studio",
                    "Pycharm",
                  ])
                )
              );
            }

            /**
             * Get the targeted tasks that are running
             */
            async check_tasks() {
              Logger.log(`THis.snap: ${this.snap}`);
              const current_tasks = await this.snap();
              Logger.log(`Checking tasks... Current tasks: ${current_tasks}`);
              return current_tasks
                .map((value) => {
                  return this.targets.includes(value) ? value : null;
                })
                .filter((value) => value); // check if any of the values are truthy
            }

            /**
             * Set the user's status
             * @param set_to The status to set. This may be dnd, online, invisible, or idle
             */
            async set_status(set_to: string): Promise<void> {
              let UserSettingsUpdater = Bapi.findModuleByProps(
                "updateLocalSettings"
              );
              UserSettingsUpdater.updateLocalSettings({
                status: set_to,
              });
            }

            /**
             * Continually check for a target being started or stopped
             */
            async loop() {
              const sleep = () => new Promise((r) => setTimeout(r, 15000)); // sleep for 15 seconds
              let new_running: Array<string> = [];
              while (true) {
                const current_targets = await this.check_tasks();
                console.log(`Current targets: ${current_targets}`);
                // add the new tasks and remove the ones that have stopped
                this.running.forEach((value) => {
                  if (current_targets.includes(value)) {
                    new_running = new_running.concat(value);
                  }
                });
                this.running = new_running;
                console.log(`New running: ${new_running}`);
                // set the status if running, remove status if not running
                const change_to: string = this.running ? "dnd" : "online";
                console.log(`New status: ${change_to}`);
                this.set_status(change_to);

                // sleep for 15 seconds
                await sleep();
              }
            }

            /**
             * Create a set of switches to take in whether to check for their status
             * @returns n switches with values from names
             */
            button_set(names: Array<string>): Array<object> {
              return names.map((name) => {
                return new Settings.Switch(
                  name,
                  "Set DND when this process runs",
                  false,
                  (new_val: boolean) => {
                    this.settings.tracked_items[`${name}_btn`] = new_val;
                  }
                );
              });
            }
          };
        };
        return CodingDND(Plugin, Api);
        // @ts-ignore
      })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
