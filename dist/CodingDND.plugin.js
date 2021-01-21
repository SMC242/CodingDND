/**
 * @name CodingDND
 * @invite d65ujkS
 * @authorId 395598378387636234
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
const default_settings = {
    tracked_items: {
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
    },
    mute_targets: {},
    active_status: "dnd",
    inactive_status: "online",
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
            version: "1.2.",
            description: "This plugin will set the Do Not Disturb status when you open an IDE.",
            github: "https://github.com/SMC242/CodingDND/tree/stable",
            github_raw: "https://raw.githubusercontent.com/SMC242/CodingDND/stable/CodingDND.plugin.js",
        },
        changelog: [
            {
                title: "Auto-refreshing status cache",
                type: "added",
                items: [
                    "The plug-in now copes with other devices changing the status.",
                ],
            },
            {
                title: "Bug fixes",
                type: "fixed",
                items: [
                    "Fixed issue with loading the targets",
                    "Channel muting now works again (broken by an API change)",
                ],
            },
            {
                title: "Mute channels update!",
                type: "added",
                items: [
                    "You can now have channels muted when targets are running.",
                    "To add a channel to the mute list, right click it and select `Add to muted channels menu`.",
                    "Then go to the plug-in's settings --> Mute Channels to enable/disable muting of the channel.",
                    "You will need to reset your settings file as there is a new format.",
                    "Feel free to ping me/open an issue if you have ideas for further updates. I have added all the features I planned.",
                ],
            },
            {
                title: "Custom processes are now saved!",
                type: "fixed",
                items: [
                    "Custom process settings were sometimes not being saved.",
                    "They should work now :)",
                ],
            },
            {
                title: "Settings bugs fixes",
                type: "fixed",
                items: [
                    "Settings were being incorrectly loaded previously",
                    "I've added some settings format verification",
                ],
            },
            {
                title: "Please delete your settings file",
                type: "fixed",
                items: [
                    "I changed the format of the settings file.",
                    "You can delete it by going into your plugins folder and deleting `CodingDND.config.json`",
                ],
            },
            {
                title: "New support server",
                type: "added",
                items: [
                    "There is now a dedicated server for all my projects. Come check it out :)",
                    "https://discord.gg/d65ujkS",
                ],
            },
            {
                title: "Custom Process Update",
                type: "added",
                items: [
                    "There is now a menu in settings where you can select non-default processes to track.",
                ],
            },
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
                const { Logger, Patcher, Settings, WebpackModules, DiscordModules: { React }, } = Library;
                return class CodingDND extends Plugin {
                    constructor() {
                        super();
                        this.running = [];
                        this.targets = [];
                        this.run_loop = true; // used to stop the loop
                        this.settings_panel;
                        // get process parser
                        this.get_all_processes = get_process_parser(); // decide the platform only once
                        // get the relevant webpack modules
                        this.status_updater = Bapi.findModuleByProps("updateLocalSettings");
                        this.muter = Bapi.findModuleByProps("updateChannelOverrideSettings");
                        this.mute_getter = Bapi.findModuleByProps("isChannelMuted");
                        this.channel_getter = Bapi.findModuleByProps("getChannel");
                        this.status_getter = Bapi.findModuleByProps("getStatus");
                        this.user_id = Bapi.findModuleByProps("getCurrentUser").getCurrentUser().id;
                        // initialise last_status to the current status
                        this.last_status = this.get_status();
                        // initialise the settings if this is the first run
                        const settings_from_config = Bapi.loadData("CodingDND", "settings");
                        if (settings_from_config) {
                            const loaded_settings = settings_from_config; // NOTE: TS wasn't inferring that it can't be null at this point so I added this type cast
                            // validate the settings format
                            // NOTE: this is only a surface check
                            if (!Object.keys(default_settings)
                                .map((key) => key in loaded_settings)
                                .every((value) => value)) {
                                Bapi.showToast("Settings format possibly invalid. Please delete `CodingDND.config.json` and reload.", { type: "warning" });
                            }
                            this.settings = loaded_settings;
                        }
                        else {
                            this.settings = default_settings;
                        }
                        // get the names of the currently tracked processes
                        this.targets = Array.from(Object.values(this.settings.tracked_items), // get the key: value pairs
                        (item) => {
                            return item.is_tracked ? item.process_names : null; // only add the name's corresponding alias if it's tracked
                        })
                            .filter(not_empty) // only keep the strings
                            .flat(); // convert to Array<string> instead of Array<Array<string>>
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
                        // start the loop
                        this.run_loop = true; // ensure that the loop restarts in the case of a reload
                        this.loop();
                        Logger.log("Tracking loop started");
                        // start the status updater
                        this.status_refresh_loop();
                        Logger.log("Status refresher loop started");
                        // patch the menus
                        this.patch_channel_ctx_menu();
                        Logger.log("Injected custom channel context menus");
                    }
                    onStop() {
                        Logger.log("Stopped");
                        this.run_loop = false;
                        Patcher.unpatchAll();
                    }
                    load() {
                        super.load();
                        this.run_loop = true; // in case it's being reloaded
                    }
                    /**
                     * Set the user's status
                     * @param set_to The status to set. This may be dnd, online, invisible, or idle
                     */
                    async set_status(set_to) {
                        if (!["online", "dnd", "idle", "invisible"].includes(set_to)) {
                            throw Error('Invalid status name. It must be "online", "dnd", "idle", or "invisible"');
                        }
                        this.status_updater.updateLocalSettings({
                            status: set_to,
                        });
                    }
                    /**
                     * Get the user's current status
                     */
                    get_status() {
                        return this.status_getter.getStatus(this.user_id // get the current user's ID
                        );
                    }
                    /** Change the user's status depending on whether targets are running */
                    change_status() {
                        // set the status if running, remove status if not running
                        const change_to = this.running.length // an empty list is truthy BRUH
                            ? this.settings.active_status
                            : this.settings.inactive_status;
                        // only make an API call if the status will change
                        if (change_to !== this.last_status) {
                            Logger.log(`Setting new status: ${change_to}`);
                            this.set_status(change_to);
                            this.last_status = change_to;
                        }
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
                            this.change_status();
                            this.update_channel_mutes();
                            // sleep for 30 seconds
                            await sleep();
                        }
                    }
                    /**
                     * Refresh `last_status` every 10 minutes in case it changes manually.
                     */
                    async status_refresh_loop() {
                        const sleep = () => new Promise((r) => setTimeout(r, 600000)); // sleep for 10 minutes
                        while (true) {
                            // exit if cancelled
                            if (!this.run_loop) {
                                Logger.log("Status refresh loop killed.");
                                return;
                            }
                            this.last_status = this.get_status();
                            Logger.log(`Refreshed cached status. New cached status: ${this.current_status}`);
                            await sleep();
                        }
                    }
                    /**
                     * Find a channel object
                     * @param channel_id The channel to find
                     */
                    get_channel(channel_id) {
                        const channel = this.channel_getter.getChannel(channel_id);
                        // if failed to find channel, delete the channel from the settings
                        if (!channel) {
                            Bapi.showToast(`Failed to find channel. Channel id ${channel_id}`, { type: "error" });
                            this.remove_mute_channel(undefined, channel_id);
                            return null;
                        }
                        return channel;
                    }
                    /**
                     * Get whether a channel is muted
                     * @param guild_id The guild containing the channel
                     * @param channel_id The channel to check
                     */
                    is_muted(guild_id, channel_id) {
                        return this.mute_getter.isChannelMuted(guild_id, channel_id);
                    }
                    /**
                     * Mute or unmute a channel.
                     * @param guild_id The guild containing the channel
                     * @param channel_id The channel to mute/unmute
                     * @param mute Whether to mute or unmute the channel
                     */
                    set_mute(guild_id, channel_id, mute) {
                        const channel = this.get_channel(channel_id);
                        if (!channel)
                            return;
                        const muted = this.is_muted(guild_id, channel_id);
                        if (mute === muted)
                            return; // don't change the mute status if it's already what the user wants
                        this.muter.updateChannelOverrideSettings(guild_id, channel_id, {
                            muted: mute,
                        });
                    }
                    /**
                     * Register a new mute_channel to the settings object
                     * @param guild_id The snowflake ID of the guild containing the channel
                     * @param channel_id The channel to register
                     * @param channel_name The name of the channel
                     */
                    add_mute_channel(guild_id, channel_id, channel_name) {
                        const to_add = {
                            guild_id,
                            channel_id,
                            mute: false,
                        };
                        this.settings.mute_targets[channel_name] = to_add;
                        this.save_settings();
                    }
                    /**
                     * Unregister a mute_channel from the settings object. Either an id or a name can be passed.
                     * @param channel_name The name of the channel
                     * @param channel_id The id of the channel
                     */
                    remove_mute_channel(channel_name, channel_id) {
                        // raise an error if neither argument was passed
                        if (!channel_name && !channel_id) {
                            throw Error("Either channel_name or channel_id must be passed.");
                        }
                        if (channel_name) {
                            delete this.settings.mute_targets[channel_name];
                        }
                        // search for the channel name
                        else {
                            Object.entries(this.settings.mute_targets).forEach(([name, target]) => {
                                if (target.channel_id === channel_id)
                                    delete this.settings.mute_targets[name];
                            });
                        }
                    }
                    /** Mute/unmute all targeted channels depending on whether targets are running */
                    update_channel_mutes() {
                        const mute = this.targets.length ? true : false;
                        let channels_muted = [];
                        Object.entries(this.settings.mute_targets).forEach(([name, target]) => {
                            if (target.mute) {
                                this.set_mute(target.guild_id, target.channel_id, mute);
                                channels_muted.push(name);
                            }
                        });
                        Logger.log(`${mute ? "Muted" : "Unmuted"} ${channels_muted.join(", ") || "0 channels"}`);
                    }
                    /**
                     * Add the button for adding mute_channels to the channel context menus
                     */
                    patch_channel_ctx_menu() {
                        // BdApi.findModuleByDisplayName returns a module without a render method --> can't be patched
                        // the first 2 results seem to be deprecated versions of this module
                        const ChannelContextMenu = WebpackModules.findAll((m) => m.default &&
                            m.default.displayName == "ChannelListTextChannelContextMenu")[2];
                        const { MenuItem, MenuGroup } = WebpackModules.find((m) => m.MenuRadioItem && !m.default);
                        Patcher.after(ChannelContextMenu, "default", (_, [props], ret) => {
                            if (!Array.isArray(ret.props.children))
                                return ret; // something weird happened to the DOM so ignore it
                            const guild_id = props.guild.id;
                            const channel_id = props.channel.id;
                            const channel_name = props.channel.name;
                            const is_added = channel_name in this.settings.mute_targets;
                            ret.props.children.push(React.createElement(MenuGroup, {}, React.createElement(MenuItem, {
                                id: "",
                                label: is_added
                                    ? "Already in muted channels menu (CodingDND)"
                                    : "Add to muted channels menu (CodingDND)",
                                disabled: is_added ? true : false,
                                action: () => {
                                    this.add_mute_channel(guild_id, channel_id, channel_name);
                                    Bapi.showToast(`Added ${channel_name} to mute channels menu`, { type: "success" });
                                },
                            })));
                        });
                    }
                    getSettingsPanel() {
                        // create and save the settings panel
                        this.settings_panel = Settings.SettingPanel.build(this.save_settings.bind(this), this.target_process_menu, this.status_menu, this.custom_processes_menu, this.mute_channels_menu);
                        return this.settings_panel;
                    }
                    async save_settings() {
                        Bapi.saveData("CodingDND", "settings", this.settings);
                    }
                    /**
                     * Factory a set of switches
                     * @param setting_section_name The part of the settings to create Switches for (E.G tracked_items)
                     * @param description The description to give to each switch
                     * @param default_value_name The name of the member of `setting_section_name` that will be the default value of the switches
                     * @param on_change The callback for when the button is pressed.
                     * NOTE: This is needed for cases where the callback needs access to `name`.
                     * @returns Settings.Switches
                     */
                    switch_factory(setting_section_name, description, default_value_name, on_change) {
                        return Object.keys(this.settings[setting_section_name]).map((name) => {
                            return new Settings.Switch(name, description, this.settings[setting_section_name][name][default_value_name], (new_value) => on_change(name, new_value));
                        });
                    }
                    /**
                     * Get padding for increasing the height of menus
                     */
                    get menu_padding() {
                        let br_padding = [];
                        for (let i = 0; i < 10; i++) {
                            br_padding = br_padding.concat(document.createElement("br"));
                        }
                        return br_padding;
                    }
                    /** this group is for selecting `targets` */
                    get target_process_menu() {
                        const target_section = "tracked_items";
                        const description = "Set 'Do Not Disturb' when this process runs";
                        const default_value_name = "is_tracked";
                        const callback = (name, new_val) => {
                            // prevent context loss
                            (new_val ? this.track.bind(this) : this.untrack.bind(this))(name);
                        };
                        return new Settings.SettingGroup("Target Processes", {
                            callback: this.save_settings.bind(this),
                        }).append(...this.switch_factory(target_section, description, default_value_name, callback));
                    }
                    /** This group is for selecting which statuses are set when running/not running targets */
                    get status_menu() {
                        // prepare a list of possible statuses for the dropdown
                        const statuses = [
                            { label: "Online", value: "online" },
                            { label: "Idle", value: "idle" },
                            { label: "Invisible", value: "invisible" },
                            { label: "Do Not Disturb", value: "dnd" },
                        ];
                        return new Settings.SettingGroup("Statuses", {
                            callback: this.save_settings.bind(this),
                        }).append(new Settings.Dropdown("Active status", "The status to set when one of the targets is running", this.settings.active_status, statuses, (new_status) => (this.settings.active_status = new_status)), new Settings.Dropdown("Inactive status", "The status to set when none of the targets are running", this.settings.inactive_status, statuses, (new_status) => (this.settings.inactive_status = new_status)), ...this.menu_padding // NOTE: these are needed because the bottommost options in dropdowns were getting cut off the screen
                        );
                    }
                    /** This group is for tracking non-default processes */
                    get custom_processes_menu() {
                        // Put a temporary value in the custom targets Settings.SettingGroup until `get_all_processes` finishes
                        let processes_not_loaded_warning = document.createElement("p");
                        processes_not_loaded_warning = Object.assign(processes_not_loaded_warning, {
                            innerHTML: "Processes loading...",
                            id: "processes_not_loaded_warning",
                        });
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
                            this.menu_padding.map((element) => setting_group.appendChild(element)); // add padding
                            warning.remove(); // clean up the warning
                        });
                        return new Settings.SettingGroup("Custom Targets").append(processes_not_loaded_warning);
                    }
                    /** The menu for setting up which channels will be muted when targets are active */
                    get mute_channels_menu() {
                        const section_name = "mute_targets";
                        const description = "This channel will be muted when targets are running.";
                        const default_name = "mute";
                        const callback = (name, new_value) => {
                            const target = this.settings.mute_targets[name];
                            target.mute = new_value;
                            this.set_mute(target.guild_id, target.channel_id, new_value); // update the channel mute status is necessary
                        };
                        return new Settings.SettingGroup("Mute Channels").append(...this.switch_factory(section_name, description, default_name, callback));
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
                        // ignore already added processes
                        if (name in this.settings.tracked_items) {
                            Bapi.showToast("That has already been added! See the Target Processes menu to enable it.", { type: "error" });
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
                        const new_switch = new Settings.Switch(name, "Set 'Do Not Disturb' when this process runs", this.settings.tracked_items[name].is_tracked, (new_val) => {
                            (new_val ? this.track.bind(this) : this.untrack.bind(this))(name);
                            this.save_settings();
                        });
                        const switch_ele = new_switch.getElement();
                        switch_ele.id = "switch_ele"; // use this to get the node and attach observer
                        // add it to the settings panel
                        const target_processes_settings_group = this
                            .settings_panel.childNodes[0]; // settings_panel will be defined when this is called
                        const group_elements = target_processes_settings_group.childNodes;
                        const switch_list = group_elements[3];
                        switch_list.appendChild(new_switch.getElement());
                    }
                };
            };
            return CodingDND(Plugin, Api);
            // @ts-ignore
        })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
//# sourceMappingURL=CodingDND.plugin.js.map