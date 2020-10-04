/**
 * @name CodingDND
 * @invite https://joindtwm.net/join
 * @authorID 395598378387636234
 * @website https://github.com/SMC242/CodingDND
 * @source https://github.com/SMC242/CodingDND/tree/master/src/dst/CodingDND.js
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var Bapi = BdApi;
module.exports = (function () {
    var config = {
        info: {
            name: "CodingDND",
            authors: [
                {
                    name: "[DTWM] benmitchellmtbV5",
                    discord_id: "395598378387636234",
                    github_username: "SMC242"
                },
            ],
            version: "0.0.0",
            description: "Getting started",
            github: "https://github.com/SMC242/CodingDND",
            github_raw: "https://github.com/SMC242/CodingDND/tree/master/src/dst/CodingDND.js"
        },
        changelog: [
            { title: "New Stuff", items: ["Added more settings", "Added changelog"] },
        ],
        main: "CodingDND.js"
    };
    // @ts-ignore
    return !global.ZeresPluginLibrary
        ? /** @class */ (function () {
            function class_1() {
                this._config = config;
            }
            class_1.prototype.getName = function () {
                return config.info.name;
            };
            class_1.prototype.getAuthor = function () {
                return config.info.authors.map(function (a) { return a.name; }).join(", ");
            };
            class_1.prototype.getDescription = function () {
                return config.info.description;
            };
            class_1.prototype.getVersion = function () {
                return config.info.version;
            };
            class_1.prototype.load = function () {
                var _this = this;
                Bapi.showConfirmationModal("Library Missing", "The library plugin needed for " + config.info.name + " is missing. Please click Download Now to install it.", {
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onConfirm: function () {
                        require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", function (error, response, body) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (error)
                                            return [2 /*return*/, require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js")];
                                        return [4 /*yield*/, new Promise(function (r) {
                                                return require("fs").writeFile(require("path").join(Bapi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r);
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    }
                });
            };
            class_1.prototype.start = function () { };
            class_1.prototype.stop = function () { };
            return class_1;
        }()) : (function (_a) {
        var Plugin = _a[0], Api = _a[1];
        var plugin = function (Plugin, Library) {
            var Logger = Library.Logger, Patcher = Library.Patcher, Settings = Library.Settings;
            return /** @class */ (function (_super) {
                __extends(CodingDND, _super);
                function CodingDND() {
                    return _super.call(this) || this;
                }
                CodingDND.prototype.onStart = function () {
                    Logger.log("Started");
                    Patcher.before(Logger, "log", function (t, a) {
                        a[0] = "Patched Message: " + a[0];
                    });
                };
                CodingDND.prototype.onStop = function () {
                    Logger.log("Stopped");
                    Patcher.unpatchAll();
                };
                CodingDND.prototype.getSettingsPanel = function () {
                    return Settings.SettingPanel.build(this.saveSettings.bind(this), new Settings.SettingGroup("Example Plugin Settings").append(null));
                };
                return CodingDND;
            }(Plugin));
        };
        return plugin(Plugin, Api);
        // @ts-ignore
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
