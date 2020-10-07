/**
 * @name CodingDND
 * @invite https://joindtwm.net/join
 * @authorID 395598378387636234
 * @website https://github.com/SMC242/CodingDND
 * @source https://github.com/SMC242/CodingDND/tree/master/src/dst/CodingDND.js
 */

// install process-list if not installed
try {
  var snap = require("process-list");
} catch (error) {
  // attempt to install it with npm
  const { exec } = require("child_process");
  exec("echo Attempting to install 'process-list' from NPM", (error) => {}); // notify user
  exec("npm install process-list", (error) => {
    if (error) {
      // failed to install
      console.log("Must install `process-list` from NPM to use CodingDND");
      process.exit(1);
    }
  });
}

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
        "https://github.com/SMC242/CodingDND/tree/master/src/dist/CodingDND.js",
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

            start() {
              Logger.log("Started");
              Patcher.before(Logger, "log", (t, a) => {
                a[0] = "Patched Message: " + a[0];
              });
              this.loop();
            }
            stop() {
              Logger.log("Stopped");
              Patcher.unpatchAll();
            }
            load() {}
            onLoad() {}

            getSettingsPanel() {
              return Settings.SettingPanel.build(
                this.saveSettings.bind(this),
                this.button_set([
                  "Atom",
                  "Visual Studio Code",
                  "IntelliJ",
                  "Eclipse",
                  "Visual Studio",
                  "Pycharm",
                ])
              );
            }

            /**
             * Get the targeted tasks that are running
             */
            async check_tasks() {
              const current_tasks = await snap("name");
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
                // add the new tasks and remove the ones that have stopped
                this.running.forEach((value) => {
                  if (current_targets.includes(value)) {
                    new_running = new_running.concat(value);
                  }
                });
                // set the status if running, remove status if not running
                this.set_status(this.running ? "DND" : "Online");

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
