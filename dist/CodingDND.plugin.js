/**
 * @name CodingDND
 * @invite AaMz4gp
 * @authorId "395598378387636234"
 * @website https://github.com/SMC242/CodingDND
 * @source https://raw.githubusercontent.com/SMC242/CodingDND/stable/CodingDND.plugin.js
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
// typescript stuff
function not_empty(value) {
    return value != undefined; // checks for both null and undefined
}
/**
 * System agnostic method of finding all the process names
 * @returns The function to get the process names with duplicates and extensions removed.
 */
function get_process_parser() {
    /**
     * Removes the file extension if exists.
     * @param process_name The name to remove the extension from
     */
    function strip_extension(process_name) {
        const end = process_name.lastIndexOf(".");
        return process_name.slice(0, end > 0 ? end : undefined);
    }
    // this is the internal part
    /**
     * Get the running process list and parse it into just the names. System agnostic
     * @param system_specifics The relevant information of the current environment
     * @returns Array<string> of unique process names
     */
    async function parser(system_specifics) {
        let processes = new Set();
        // this returns a buffer which is converted to string
        const raw_output = execSync(system_specifics.command).toString();
        // parsing functions here
        const slicer = (row) => row.slice(...system_specifics.row_range); // get the end of the name/command column
        // iterate over each row and parse it into the name only
        const process_rows = raw_output.split(system_specifics.line_ending);
        for (let i = system_specifics.table_start; i < process_rows.length; i++) {
            processes.add(slicer(process_rows[i]).trim());
        }
        return Array.from(processes).map(strip_extension);
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
    const current_settings = process.platform === "win32" ? windows_settings : linux_settings;
    return () => parser(current_settings);
}
/**
 * sort an array recursively by repeatedly splitting it in half and comparing the two pieces.
 * NOTE: the complexity is O(n log n) and I chose this algorithm because it has a consistent complexity in best, average, and worst cases
 * @param unsorted the array to sort
 * @returns the sorted array
 */
function merge_sort(unsorted) {
    // Merge the two arrays: left and right
    function merge(left, right) {
        let result = [];
        let left_index = 0;
        let right_index = 0;
        // Concat the arrays until result is sorted
        while (left_index < left.length && right_index < right.length) {
            // check for one of the sides being empty
            if (left[left_index] < right[right_index]) {
                result.push(left[left_index]);
                left_index++; // move left array cursor
            }
            else {
                result.push(right[right_index]);
                right_index++; // move right array cursor
            }
        }
        // concat because there will be one element left in one of the lists
        return result
            .concat(left.slice(left_index))
            .concat(right.slice(right_index));
    }
    // Don't sort unless there's multiple elements
    if (unsorted.length <= 1) {
        return unsorted;
    }
    // find the middle index
    const middle = Math.floor(unsorted.length / 2);
    // Split the array
    const left = unsorted.slice(0, middle);
    const right = unsorted.slice(middle);
    // Recurse until finished
    return merge(merge_sort(left), merge_sort(right));
}
const default_tracked_items = {
    Atom: {
        process_names: ["atom"],
        is_tracked: false,
    },
    Eclipse: {
        process_names: ["eclipse"],
        is_tracked: false,
    },
    "Intellij IDEA": {
        process_names: ["idea", "idea64"],
        is_tracked: false,
    },
    Pycharm: {
        process_names: ["pycharm64", "charm"],
        is_tracked: false,
    },
    "Visual Studio": {
        process_names: ["devenv"],
        is_tracked: false,
    },
    "Visual Studio Code": {
        process_names: ["Code"],
        is_tracked: false,
    },
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
            version: "0.5.0",
            description: "This plugin will set the Do Not Disturb status when you open an IDE.",
            github: "https://github.com/SMC242/CodingDND/tree/stable",
            github_raw: "https://raw.githubusercontent.com/SMC242/CodingDND/stable/CodingDND.plugin.js",
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
            {
                title: "Custom Process Update",
                type: "added",
                items: [
                    "There is now a menu in settings where you can select non-default processes to track.",
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
                        this.settings_panel;
                        // get process parser
                        this.get_all_processes = get_process_parser(); // decide the platform only once
                        // initialise last_status to the current status
                        this.last_status = Bapi.findModuleByProps("getStatus").getStatus(Bapi.findModuleByProps("getToken").getId() // get the current user's ID
                        );
                        // initialise the settings if this is the first run
                        this.settings = (_a = Bapi.loadData("CodingDND", "settings")) !== null && _a !== void 0 ? _a : {
                            tracked_items: default_tracked_items,
                            active_status: "dnd",
                            inactive_status: "online",
                        };
                        // get the names of the currently tracked processes
                        this.targets = Array.from(Object.entries(this.settings.tracked_items), // get the key: value pairs
                        ([alias, item]) => {
                            return item.is_tracked ? alias : null; // only add the name's corresponding alias if it's tracked
                        }).filter(not_empty); // only keep the strings
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
                    onStart() {
                        Logger.log("Started");
                        Patcher.before(Logger, "log", (t, a) => {
                            a[0] = "Patched Message: " + a[0];
                        });
                        this.run_loop = true; // ensure that the loop restarts in the case of a reload
                        this.loop();
                        Logger.log("Tracking loop started");
                    }
                    onStop() {
                        Logger.log("Stopped");
                        this.run_loop = false;
                        Patcher.unpatchAll();
                    }
                    load() {
                        super.load();
                    }
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
                            // exit if cancelled
                            if (!this.run_loop) {
                                Logger.log("Tracking loop killed.");
                                return;
                            }
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
                            // log the new `running`
                            Logger.log(`Running targets detected: ${this.running.length ? this.running : "None"}`);
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
                            // sleep for 30 seconds
                            await sleep();
                        }
                    }
                    getSettingsPanel() {
                        // prepare a list of possible statuses for the dropdown
                        const statuses = [
                            { label: "Online", value: "online" },
                            { label: "Idle", value: "idle" },
                            { label: "Invisible", value: "invisible" },
                            { label: "Do Not Disturb", value: "dnd" },
                        ];
                        // Put a temporary value in the custom targets Settings.SettingGroup until `get_all_processes` finishes
                        let processes_not_loaded_warning = document.createElement("p");
                        processes_not_loaded_warning = Object.assign(processes_not_loaded_warning, {
                            innerHTML: "Processes loading...",
                            id: "processes_not_loaded_warning",
                        });
                        // these are needed because the bottommost options in dropdowns were getting cut off the screen
                        let br_padding = [];
                        for (let i = 0; i < 10; i++) {
                            br_padding = br_padding.concat(document.createElement("br"));
                        }
                        //  populate the list of processes of the dropdown whenever it finishes
                        this.get_all_processes().then((process_list) => {
                            const warning = document.getElementById("processes_not_loaded_warning");
                            // something went wrong if it's null
                            if (!warning) {
                                return;
                            }
                            // insert a dropdown now that it's loaded
                            const setting_group = warning.parentElement;
                            if (!setting_group) {
                                return;
                            }
                            // sort and parse the processes
                            let sorted_processes = merge_sort(process_list).map((name) => {
                                // change it to the dropdownitem format
                                return { label: name, value: name };
                            });
                            sorted_processes = sorted_processes.slice(1); // remove the empty string at index 0
                            setting_group.appendChild(new Settings.Dropdown("Select a custom target", "This will be added to the Target Processes menu", sorted_processes[0], sorted_processes, this.add_custom_task.bind(this), { searchable: true }).getElement());
                            br_padding.map((element) => setting_group.appendChild(element)); // add padding
                            warning.remove(); // clean up the warning
                        });
                        // create and save the settings panel
                        this.settings_panel = Settings.SettingPanel.build(this.save_settings.bind(this), 
                        // this group is for selecting `targets`
                        new Settings.SettingGroup("Target Processes", {
                            callback: this.save_settings.bind(this),
                        }).append(...this.button_set()), 
                        // this group is for selecting which statuses are set when running/not running targets
                        new Settings.SettingGroup("Statuses", {
                            callback: this.save_settings.bind(this),
                        }).append(new Settings.Dropdown("Active status", "The status to set when one of the targets is running", this.settings.active_status, statuses, (new_status) => (this.settings.active_status = new_status)), new Settings.Dropdown("Inactive status", "The status to set when none of the targets are running", this.settings.inactive_status, statuses, (new_status) => (this.settings.inactive_status = new_status)), ...br_padding), 
                        // this group is for tracking non-default processes
                        new Settings.SettingGroup("Custom Targets").append(processes_not_loaded_warning));
                        return this.settings_panel;
                    }
                    async save_settings() {
                        Bapi.saveData("CodingDND", "settings", this.settings);
                    }
                    /**
                     * Create a set of switches to take in whether to check for their status
                     * @returns Settings.Switches that correspond to a tracked item
                     */
                    button_set() {
                        return Object.keys(this.settings.tracked_items).map((name) => {
                            return new Settings.Switch(name, "Set 'Do Not Disturb' when this process runs", this.settings.tracked_items[name].is_tracked, (new_val) => {
                                // prevent context loss
                                (new_val ? this.track.bind(this) : this.untrack.bind(this))(name);
                            });
                        });
                    }
                    /**
                     * Register a new process to track
                     * @param name The name to register
                     */
                    track(name) {
                        Logger.log(`Tracked ${name}`);
                        this.settings.tracked_items[name].is_tracked = true;
                        this.targets.push(...this.settings.tracked_items[name].process_names);
                    }
                    /**
                     * Unregister a process from tracking
                     * @param name The name to unregister
                     */
                    untrack(name) {
                        Logger.log(`Untracked ${name}`);
                        this.settings.tracked_items[name].is_tracked = false;
                        const actual_names = this.settings
                            .tracked_items[name].process_names;
                        this.targets = this.targets.filter((value) => !actual_names.includes(value));
                    }
                    /**
                     * Add a user-inputted task to `settings.tracked_items`
                     * @param name the name to register
                     */
                    add_custom_task(name) {
                        // `null` is passed to this function if the user clicks while the tasks load
                        if (!name) {
                            return;
                        }
                        this.settings.tracked_items[name] = {
                            process_names: [name],
                            is_tracked: false,
                        };
                        // save the new settings as this won't be caught by `on_change` due to the fuckery with adding the dropdown after the panel is created
                        this.save_settings();
                        // notify user
                        Bapi.showToast(`${name} can now be selected in the Target Processes menu`, { type: "info" });
                        // add it to the settings panel
                        const target_processes_settings_group = this
                            .settings_panel.childNodes[0]; // settings_panel will be defined when this is called
                        const group_elements = target_processes_settings_group.childNodes;
                        const switch_list = group_elements[3];
                        switch_list.appendChild(new Settings.Switch(name, "Set 'Do Not Disturb' when this process runs", this.settings.tracked_items[name].is_tracked, (new_val) => {
                            // prevent context loss
                            (new_val ? this.track.bind(this) : this.untrack.bind(this))(name);
                        }).getElement());
                    }
                };
            };
            return CodingDND(Plugin, Api);
            // @ts-ignore
        })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
//# sourceMappingURL=CodingDND.plugin.js.map