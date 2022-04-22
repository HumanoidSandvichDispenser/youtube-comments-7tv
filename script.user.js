// ==UserScript==
// @name        7TV Emotes on YouTube Comments
// @namespace   7tv-yt-comments
// @description A third party thing that shows a YouTube channel's 7TV emotes in the comments section.
// @include     https://www.youtube.com/watch*
// @version     1.1
// @run-at      document-start
// @grant       GM.xmlHttpRequest
// ==/UserScript==
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
/*
 * request.js
 * Copyright (C) 2022 sandvich <sandvich@artix>
 *
 * Distributed under terms of the GPLv3 license.
 */
var emotes = {};
function fetchEmotes(apiURL) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    // @ts-ignore
                    GM.xmlHttpRequest({
                        method: "GET",
                        url: apiURL,
                        headers: {
                            "Accept": "application/json"
                        },
                        responseType: "json",
                        onload: function (response) {
                            response.response.forEach(function (emote) {
                                emotes[emote.name] = emote.urls[0][1];
                                // Since we updated the emotes list, some comments may not have
                                // the new emotes. Therefore we must clear the list of parsed
                                // comments.
                                parsedComments.clear();
                            });
                            resolve();
                        },
                        onerror: function (response) {
                            reject(response);
                        }
                    });
                })];
        });
    });
}
function fetchChannelEmotes(channelID) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchEmotes("https://api.7tv.app/v2/users/".concat(channelID, "/emotes"))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function fetchGlobalEmotes() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchEmotes("https://api.7tv.app/v2/emotes/global")];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/*
 * main.js
 * Copyright (C) 2022 sandvich <sandvich@artix>
 *
 * Distributed under terms of the GPLv3 license.
 */
/// <reference path="request.ts" />
var parsedComments = new Map();
/**
 * @deprecated This function's purpose has been replaced by MutationObserver
 */
function scanComments(skipParsedComments) {
    if (skipParsedComments === void 0) { skipParsedComments = true; }
    var comments = document.querySelectorAll(".ytd-comment-renderer#content-text");
    comments.forEach(function (comment) {
        // if we already parsed emotes for this comment, skip it
        if (skipParsedComments && parsedComments.has(comment)) {
            return;
        }
        placeEmotes(comment);
        parsedComments.set(comment, true);
    });
}
function placeEmotes(comment) {
    var words = comment.innerHTML.split(" ");
    words.forEach(function (word, i) {
        if (word in emotes) {
            var url = emotes[word];
            var html = "<img src=\"".concat(url, "\">");
            words[i] = html;
        }
    });
    comment.innerHTML = words.join(" ");
}
function recursivelyParseNodes(node) {
    if (node.nodeType == Node.ELEMENT_NODE) {
        var children = node.childNodes;
        var element = node;
        // text inside multiple style tags will now be parsed for emotes
        children.forEach(function (child) {
            recursivelyParseNodes(child);
        });
        placeEmotes(element);
    }
}
var commentsObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
            if (node.nodeType == Node.ELEMENT_NODE) {
                var element = node;
                if (element.matches(".ytd-comment-renderer#content-text")) {
                    recursivelyParseNodes(node);
                }
            }
        });
    });
});
function observeComments() {
    return __awaiter(this, void 0, void 0, function () {
        var comments;
        return __generator(this, function (_a) {
            comments = document.querySelector("#comments #sections #contents");
            commentsObserver.observe(comments, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: false
            });
            return [2 /*return*/];
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var channelLink, channelID;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    channelLink = document
                        .querySelector(".ytd-channel-name .yt-simple-endpoint");
                    if (channelLink == undefined || channelLink == null) {
                        setTimeout(main, 2500);
                        return [2 /*return*/];
                    }
                    channelID = channelLink.href.split("/").slice(-1)[0];
                    console.log(channelID);
                    // fetch global emotes before fetching channel emotes
                    return [4 /*yield*/, fetchGlobalEmotes()];
                case 1:
                    // fetch global emotes before fetching channel emotes
                    _a.sent();
                    return [4 /*yield*/, fetchChannelEmotes(channelID)];
                case 2:
                    _a.sent();
                    observeComments();
                    return [2 /*return*/];
            }
        });
    });
}
main();
