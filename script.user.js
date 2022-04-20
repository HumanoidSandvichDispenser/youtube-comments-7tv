// ==UserScript==
// @name        7TV Emotes on YouTube Comments
// @namespace   7tv-yt-comments
// @description A third party thing that shows a YouTube channel's 7TV emotes in the comments section.
// @include     https://www.youtube.com/watch*
// @version     1.0
// @run-at      document-start
// @grant       GM.xmlHttpRequest
// ==/UserScript==
/*
 * request.js
 * Copyright (C) 2022 sandvich <sandvich@artix>
 *
 * Distributed under terms of the GPLv3 license.
 */
var emotes = {};
function fetchChannelEmotes(channelID) {
    // @ts-ignore
    GM.xmlHttpRequest({
        method: "GET",
        url: "https://api.7tv.app/v2/users/".concat(channelID, "/emotes"),
        headers: {
            "Accept": "application/json"
        },
        responseType: "json",
        onload: function (response) {
            response.response.forEach(function (emote) {
                emotes[emote.name] = emote.urls[0][1];
            });
            scanComments();
        }
    });
}
/*
 * main.js
 * Copyright (C) 2022 sandvich <sandvich@artix>
 *
 * Distributed under terms of the GPLv3 license.
 */
/// <reference path="request.ts" />
function scanComments() {
    var comments = document.querySelectorAll(".ytd-comment-renderer#content-text");
    comments.forEach(function (comment) {
        placeEmote(comment);
    });
}
function placeEmote(comment) {
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
function main() {
    // this is just a hacky way to get the channel ID
    var channelLink = document.querySelector(".ytd-channel-name .yt-simple-endpoint");
    if (channelLink == undefined || channelLink == null) {
        setTimeout(main, 5000);
        return;
    }
    var channelID = channelLink.href.split("/").slice(-1)[0];
    console.log(channelID);
    fetchChannelEmotes(channelID);
    // TODO: replace this with a jquery `$.initialize()`
    setInterval(scanComments, 250);
}
main();
