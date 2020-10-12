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
const { execSync } = require("child_process");
/**
 * System agnostic method of finding all the process names
 * @returns The process names
 */
async function get_all_processes() {
    // this is the internal part
    /**
     * Get the running process list and parse it into just the names. System agnostic
     * @param system_specifics The relevant information of the current environment
     * @returns Array<string> of process names
     */
    async function parser(system_specifics) {
        let processes = [];
        // this returns a buffer which is converted to string
        const raw_output = execSync(system_specifics.command).toString();
        // parsing functions here
        const slicer = (row) => row.slice(...system_specifics.row_range); // get the end of the name/command column
        // iterate over each row and parse it into the name only
        const process_rows = raw_output.split(system_specifics.line_ending);
        for (let i = system_specifics.table_start; i < process_rows.length; i++) {
            processes.push(slicer(process_rows[i]).trim());
        }
        return processes;
    }
    // system settings defined here
    const windows_settings = {
        row_range: [0, 29],
        table_start: 3,
        line_ending: "\r\n",
        command: "tasklist",
    };
    const linux_settings = {
        row_range: [67, undefined],
        table_start: 1,
        line_ending: "\n",
        command: "ps -aux",
    };
    // decide which platform is being used
    return await parser(process.platform === "win32" ? windows_settings : linux_settings);
}
function not_empty(value) {
    return value != undefined; // checks for both null and undefined
}
const aliases = {
    "Visual Studio Code": "Code.exe",
    Atom: "atom.exe",
    "Visual Studio": "devenv.exe",
    IntelliJ: "idea64.exe",
    Eclipse: "eclipse.exe",
    Pycharm: "pycharm64.exe",
};
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
            description: "This plugin will set the Do Not Disturb status when you open an IDE.",
            github: "https://github.com/SMC242/CodingDND",
            github_raw: "https://github.com/SMC242/CodingDND/blob/master/src/CodingDND.plugin.js",
            source: "https://github.com/SMC242/CodingDND/blob/master/src/CodingDND.plugin.ts",
        },
        changelog: [
            {
                title: "First release!",
                items: [
                    "All IDEs are supported (Atom, VSCode, IntelliJ IDEA, Eclipse, Visual Studio, Pycharm)",
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
                Bapi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onConfirm: () => {
                        require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                            if (error)
                                return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                            await new Promise((r) => require("fs").writeFile(require("path").join(Bapi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                        });
                    },
                });
            }
            start() { }
            stop() { }
        }
        : (([Plugin, Api]) => {
            const CodingDND = (Plugin, Library) => {
                const { Logger, Patcher, Settings } = Library;
                return class CodingDND extends Plugin {
                    constructor() {
                        var _a;
                        super();
                        this.running = [];
                        this.targets = [];
                        this.run_loop = true; // used to stop the loop
                        // initialise last_status to the current status
                        this.last_status = Bapi.findModuleByProps("getStatus").getStatus(Bapi.findModuleByProps("getToken").getId() // get the current user's ID
                        );
                        this.settings = (_a = Bapi.loadData("CodingDND", "settings")) !== null && _a !== void 0 ? _a : {
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
                        this.targets = Array.from(Object.entries(this.settings.tracked_items), // get the key: value pairs
                        (pair) => {
                            return pair[1] ? aliases[pair[0]] : null; // only add the name's corresponding alias if it's tracked
                        }).filter(not_empty); // only keep the strings
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
                        this.run_loop = false;
                        Patcher.unpatchAll();
                    }
                    load() { }
                    /**
                     * Set the user's status
                     * @param set_to The status to set. This may be dnd, online, invisible, or idle
                     */
                    async set_status(set_to) {
                        let UserSettingsUpdater = Bapi.findModuleByProps("updateLocalSettings");
                        UserSettingsUpdater.updateLocalSettings({
                            status: set_to,
                        });
                    }
                    /**
                     * Get the targeted tasks that are running
                     */
                    async check_tasks() {
                        const current_tasks = await get_all_processes();
                        return current_tasks
                            .map((value) => {
                            return this.targets.includes(value) ? value : null;
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
                                return;
                            } // exit if cancelled
                            // get the running targeted tasks
                            const current_targets = await this.check_tasks();
                            // remove the tasks that stopped
                            this.running = this.running
                                .map((old_val) => current_targets.includes(old_val) ? old_val : null)
                                .filter(not_empty);
                            // add the tasks that started
                            current_targets.map((name) => {
                                if (!this.running.includes(name)) {
                                    this.running.push(name);
                                }
                            });
                            Logger.log(`Running targets detected: ${this.running}`);
                            // set the status if running, remove status if not running
                            const change_to = this.running.length // an empty list is truthy BRUH
                                ? "dnd"
                                : "online";
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
                        return Settings.SettingPanel.build(this.save_settings, 
                        // this group is for selecting `targets`
                        new Settings.SettingGroup("Target Processes").append(...this.button_set()));
                    }
                    async save_settings(new_settings) {
                        Bapi.saveData("CodingDND", "settings", new_settings);
                    }
                    /**
                     * Create a set of switches to take in whether to check for their status
                     * @returns Settings.Switches that correspond to a tracked item
                     */
                    button_set() {
                        return Object.keys(this.settings.tracked_items).map((name) => {
                            return new Settings.Switch(name, "Set 'Do Not Disturb' when this process runs", this.settings.tracked_items[name], (new_val) => {
                                (new_val ? this.track : this.untrack)(name);
                            });
                        });
                    }
                    /**
                     * Register a new process to track
                     * @param name The name to register
                     */
                    track(name) {
                        Logger.log(`Tracked ${name}`);
                        let inst = Bapi.getPlugin("CodingDND"); // for some reason, the context isn't defined in this function. I had to define ti by getting BdApi's version instead
                        const alias = aliases[name];
                        inst.settings.tracked_items[name] = true;
                        inst.targets.push(alias);
                    }
                    /**
                     * Unregister a process from tracking
                     * @param name The name to unregister
                     */
                    untrack(name) {
                        Logger.log(`Untracked ${name}`);
                        let inst = Bapi.getPlugin("CodingDND");
                        const alias = aliases[name];
                        inst.settings.tracked_items[name] = false;
                        inst.targets = inst.targets.filter((value) => value !== alias);
                    }
                };
            };
            return CodingDND(Plugin, Api);
            // @ts-ignore
        })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
//# sourceMappingURL=CodingDND.plugin.js.map