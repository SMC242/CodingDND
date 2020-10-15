/**
 * @name CodingDND
 * @invite AaMz4gp
 * @authorId 723730866370510928
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
const Bapi: any = BdApi;
const { execSync } = require("child_process");

/**
 * System agnostic method of finding all the process names
 * @returns The function to get the process names with duplicates and extensions removed.
 */
async function get_process_parser(): Promise<Function> {
  // internal interface for defining system-specific info about the task list commands
  interface sys_settings {
    row_range: [number | undefined, number | undefined]; // where to slice the row to get the process name. Pass undefined to not set a limit
    table_start: number; // the line after the table boilerplate ends
    line_ending: string; // how the line ends E.G `\n`
    command: string; // the name of the command that gets the process list
  }

  /**
   * Removes the file extension if exists.
   * @param process_name The name to remove the extension from
   */
  function strip_extension(process_name: string): string {
    const end = process_name.lastIndexOf(".");
    return process_name.slice(0, end > 0 ? end : undefined);
  }

  // this is the internal part
  /**
   * Get the running process list and parse it into just the names. System agnostic
   * @param system_specifics The relevant information of the current environment
   * @returns Array<string> of unique process names
   */
  async function parser(
    system_specifics: sys_settings
  ): Promise<Array<string>> {
    let processes: Set<string> = new Set();

    // this returns a buffer which is converted to string
    const raw_output = execSync(system_specifics.command).toString();

    // parsing functions here
    const slicer = (row: string) => row.slice(...system_specifics.row_range); // get the end of the name/command column

    // iterate over each row and parse it into the name only
    const process_rows = raw_output.split(system_specifics.line_ending);
    for (let i = system_specifics.table_start; i < process_rows.length; i++) {
      processes.add(slicer(process_rows[i]).trim());
    }
    return Array.from(processes).map(strip_extension);
  }

  // system settings defined here
  const windows_settings: sys_settings = {
    row_range: [0, 29],
    table_start: 3, // there's 3 rows of boilerplate
    line_ending: "\r\n",
    command: "tasklist",
  };
  const linux_settings: sys_settings = {
    row_range: [67, undefined],
    table_start: 1, // there's 1 row of boilerplate
    line_ending: "\n",
    command: "ps -aux",
  };

  // decide which platform is being used
  const current_settings =
    process.platform === "win32" ? windows_settings : linux_settings;
  return () => parser(current_settings);
}

function not_empty<incoming_t>(
  value: incoming_t | null | undefined
): value is incoming_t {
  return value != undefined; // checks for both null and undefined
}

/**
 * @tracked_items the name of the target and whether it is currently being tracked
 * @active_status The status to set when one of the targets is running. Must be one of: ["online", "idle", "invisible", "dnd"]
 * @inactive_status The status to set when one of the targets is not running. Must be one of: ["online", "idle", "invisible", "dnd"]
 */
interface settings_obj {
  tracked_items: { [name: string]: boolean };
  active_status: string;
  inactive_status: string;
}

/**
 * Used for representing tracked processes. Processes will not always have the same name as the app so this is necessary.
 * @alias the name that the user sees. This covers the actual executable name. NOTE: the actual name must not have an extension for Linux compatibility
 */
interface tracked_aliases {
  [alias: string]: string | null;
}

const win_aliases: tracked_aliases = {
  "Visual Studio Code": "Code",
  Atom: "atom",
  "Visual Studio": "devenv",
  IntelliJ: "idea64", // !FIX: only works for 64bit. Maybe refactor tracked_aliases to be {string: Array<string>}
  Eclipse: "eclipse",
  Pycharm: "pycharm64",
};

const linux_aliases: tracked_aliases = {
  "Visual Studio Code": null,
  Atom: "atom",
  "Visual Studio": null,
  IntelliJ: "idea", // !FIX: only works for 64bit. Maybe refactor tracked_aliases to be {string: Array<string>}
  Eclipse: "eclipse",
  Pycharm: "charm",
};

// use different aliases per OS
const aliases: tracked_aliases =
  process.platform === "win32" ? win_aliases : linux_aliases;

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
      version: "0.25",
      description:
        "This plugin will set the Do Not Disturb status when you open an IDE.",
      github: "https://github.com/SMC242/CodingDND",
      github_raw:
        "https://github.com/SMC242/CodingDND/blob/master/src/CodingDND.plugin.js",
      source:
        "https://github.com/SMC242/CodingDND/blob/master/src/CodingDND.plugin.ts",
    },
    changelog: [
      {
        title: "First release!",
        items: [
          "All of the planned IDEs are supported (Atom, VSCode, IntelliJ IDEA, Eclipse, Visual Studio, Pycharm)",
          "The tracking loop should work.",
          "Please tell me if you find any bugs.",
        ],
      },
    ],
    main: "CodingDND.plugin.js",
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
            run_loop: boolean;
            last_status: string; // must be in ['online', 'invisible', 'idle', 'dnd']
            get_all_processes: Promise<Function>;

            constructor() {
              super();
              this.running = [];
              this.targets = [];
              this.run_loop = true; // used to stop the loop
              // initialise last_status to the current status
              this.last_status = Bapi.findModuleByProps("getStatus").getStatus(
                Bapi.findModuleByProps("getToken").getId() // get the current user's ID
              );
              this.settings = Bapi.loadData("CodingDND", "settings") ?? {
                tracked_items: {
                  "Visual Studio Code": false,
                  Atom: false,
                  IntelliJ: false,
                  Eclipse: false,
                  Pycharm: false,
                  "Visual Studio": false,
                },
                active_status: "dnd",
                inactive_status: "online",
              };
              // get the names of the processes
              this.targets = Array.from(
                Object.entries(this.settings.tracked_items), // get the key: value pairs
                (pair: [string, boolean]): string | null => {
                  return pair[1] ? aliases[pair[0]] : null; // only add the name's corresponding alias if it's tracked
                }
              ).filter(not_empty); // only keep the strings

              // get process parser
              this.get_all_processes = get_process_parser(); // decide the platform only once
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
              this.run_loop = true; // ensure that the loop restarts in the case of a reload
              this.loop();
            }
            onStop() {
              Logger.log("Stopped");
              this.run_loop = false;
              Patcher.unpatchAll();
            }
            load() {}

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
             * Get the targeted tasks that are running
             */
            async check_tasks(): Promise<Array<string>> {
              const current_tasks = await this.get_all_processes();
              return current_tasks
                .map((process_name) => {
                  return this.targets.includes(process_name)
                    ? process_name
                    : null;
                })
                .filter(not_empty); // check if any of the values are truthy
            }

            /**
             * Continually check for a target being started or stopped
             */
            async loop() {
              const sleep = () => new Promise((r) => setTimeout(r, 30000)); // sleep for 30 seconds
              while (true) {
                if (!this.run_loop) {
                  Logger.log("Tracking loop killed.");
                  return;
                } // exit if cancelled

                // get the running targeted tasks
                const current_targets: Array<string> = await this.check_tasks();

                // remove the tasks that stopped
                this.running = this.running
                  .map((old_val) =>
                    current_targets.includes(old_val) ? old_val : null
                  )
                  .filter(not_empty);
                // add the tasks that started
                current_targets.map((name) => {
                  if (!this.running.includes(name)) {
                    this.running.push(name);
                  }
                });
                Logger.log(
                  `Running targets detected: ${
                    this.running.length ? this.running : "None"
                  }`
                );

                // set the status if running, remove status if not running
                const change_to = this.running.length // an empty list is truthy BRUH
                  ? this.settings.active_status
                  : this.settings.inactive_status;

                // only make an API call if the status will change
                if (change_to != this.last_status) {
                  Logger.log(`Setting new status: ${change_to}`);
                  this.set_status(change_to);
                  this.last_status = change_to;
                }

                // sleep for 15 seconds
                await sleep();
              }
            }

            getSettingsPanel() {
              const statuses: Array<object> = [
                { label: "Online", value: "online" },
                { label: "Idle", value: "idle" },
                { label: "Invisible", value: "invisible" },
                { label: "Do Not Disturb", value: "dnd" },
              ];
              return Settings.SettingPanel.build(
                this.save_settings.bind(this),
                // this group is for selecting `targets`
                new Settings.SettingGroup("Target Processes", {
                  callback: this.save_settings.bind(this),
                }).append(...this.button_set()),
                // this group is for selecting which statuses are set when running/not running targets
                new Settings.SettingGroup("Statuses").append(
                  new Settings.Dropdown(
                    "Active status",
                    "The status to set when one of the targets is running",
                    this.settings.active_status,
                    statuses,
                    (new_status: string) =>
                      (this.settings.active_status = new_status)
                  ),
                  new Settings.Dropdown(
                    "Inactive status",
                    "The status to set when none of the targets are running",
                    this.settings.inactive_status,
                    (new_status: string) =>
                      (this.settings.inactive_status = new_status)
                  ),
                  // these are needed because the bottommost options were getting cut off the screen
                  document.createElement("br"),
                  document.createElement("br"),
                  document.createElement("br"),
                  document.createElement("br"),
                  document.createElement("br")
                )
              );
            }

            async save_settings(): Promise<void> {
              Bapi.saveData("CodingDND", "settings", this.settings);
            }

            /**
             * Create a set of switches to take in whether to check for their status
             * @returns Settings.Switches that correspond to a tracked item
             */
            button_set(): Array<object> {
              return Object.keys(this.settings.tracked_items).map((name) => {
                return new Settings.Switch(
                  name,
                  "Set 'Do Not Disturb' when this process runs",
                  this.settings.tracked_items[name],
                  (new_val: string) => {
                    // prevent context loss
                    (new_val ? this.track.bind(this) : this.untrack.bind(this))(
                      name
                    );
                  }
                );
              });
            }

            /**
             * Register a new process to track
             * @param name The name to register
             */
            track(name: string) {
              Logger.log(`Tracked ${name}`);
              const alias = aliases[name];
              this.settings.tracked_items[name] = true;
              if (alias) {
                this.targets.push(alias);
              } // prevent null in `targets`
            }

            /**
             * Unregister a process from tracking
             * @param name The name to unregister
             */
            untrack(name: string) {
              Logger.log(`Untracked ${name}`);
              const alias = aliases[name];
              this.settings.tracked_items[name] = false;
              this.targets = this.targets.filter((value) => value !== alias);
            }
          };
        };
        return CodingDND(Plugin, Api);
        // @ts-ignore
      })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
