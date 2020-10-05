"use strict";
/**
 * @name CodingDND
 * @invite https://joindtwm.net/join
 * @authorID 395598378387636234
 * @website https://github.com/SMC242/CodingDND
 * @source https://github.com/SMC242/CodingDND/tree/master/src/dst/CodingDND.js
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// install process-list if not installed in load()
const snap = require("process-list") || null;
if (!snap) {
    console.log("Must install `process-list` from NPM to use CodingDND");
    process.exit(1);
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
            description: "This plugin will set the Do Not Disturb status when you open an IDE. You must install `process-list` via NPM to use this plugin",
            github: "https://github.com/SMC242/CodingDND",
            github_raw: "https://github.com/SMC242/CodingDND/tree/master/src/dist/CodingDND.js",
        },
        changelog: [
            { title: "New Stuff", items: ["Added more settings", "Added changelog"] },
        ],
        main: "CodingDND.js",
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
                        require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", (error, response, body) => __awaiter(this, void 0, void 0, function* () {
                            if (error)
                                return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                            yield new Promise((r) => require("fs").writeFile(require("path").join(Bapi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                        }));
                    },
                });
            }
            start() { }
            stop() { }
        }
        : (([Plugin, Api]) => {
            const plugin = (Plugin, Library) => {
                const { Logger, Patcher, Settings } = Library;
                return class CodingDND extends Plugin {
                    constructor() {
                        super();
                        this.targets = [];
                    }
                    onStart() {
                        Logger.log("Started");
                        Patcher.before(Logger, "log", (t, a) => {
                            a[0] = "Patched Message: " + a[0];
                        });
                    }
                    onStop() {
                        Logger.log("Stopped");
                        Patcher.unpatchAll();
                    }
                    getSettingsPanel() {
                        return Settings.SettingPanel.build(this.saveSettings.bind(this), new Settings.SettingGroup("Example Plugin Settings").append(null));
                    }
                    /**
                     * Check if any of the target tasks are running
                     */
                    check_tasks() {
                        return __awaiter(this, void 0, void 0, function* () {
                            const current_tasks = yield snap("name");
                            return current_tasks
                                .map((value) => {
                                this.targets.forEach((target) => {
                                    if (value.includes(target)) {
                                        return true;
                                    }
                                });
                            })
                                .some((value) => value); // check if any of the values are truthy
                        });
                    }
                    /**
                     * Search through a sorted list for the target value.
                     * @param to_search The sorted list to search through
                     * @param target The value to find in the list
                     * @param key The function to return the value to compare with. Defaults to returning the input value.
                     * @returns The object where the target was found. Will be null if not found
                     */
                    binary_search(to_search, target, key) {
                        return __awaiter(this, void 0, void 0, function* () {
                            // set default key
                            key = key !== null && key !== void 0 ? key : function (value) {
                                value;
                            };
                            // standard binary search with a key from here
                            let mid;
                            let current;
                            let upper = to_search.length;
                            let lower = 0;
                            while (lower <= upper) {
                                mid = ~~(length + (upper - lower) / 2); // ensure this is an integer with bitwise NOT
                                current = key(to_search[mid]);
                                if (current === target)
                                    return to_search[mid];
                                else if (current < target)
                                    lower = mid + 1;
                                // discard the left part of the list
                                else
                                    upper = mid - 1; // discard the right part of the list
                            }
                            return null;
                        });
                    }
                };
            };
            return plugin(Plugin, Api);
            // @ts-ignore
        })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
//# sourceMappingURL=CodingDND.plugin.js.map