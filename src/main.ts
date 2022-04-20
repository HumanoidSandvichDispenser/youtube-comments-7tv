/*
 * main.js
 * Copyright (C) 2022 sandvich <sandvich@artix>
 *
 * Distributed under terms of the GPLv3 license.
 */

/// <reference path="request.ts" />

function scanComments(): void  {
    const comments = document.querySelectorAll(".ytd-comment-renderer#content-text");
    comments.forEach(comment => {
        placeEmote(comment);
    });
}

function placeEmote(comment: Element): void {
    const words = comment.innerHTML.split(" ");
    words.forEach((word, i) => {
        if (word in emotes) {
            const url = emotes[word];
            const html = `<img src="${url}">`
            words[i] = html;
        }
    });
    comment.innerHTML = words.join(" ");
}

function main(): void {
    // this is just a hacky way to get the channel ID
    const channelLink: HTMLAnchorElement = document.querySelector(".ytd-channel-name .yt-simple-endpoint");

    if (channelLink == undefined || channelLink == null) {
        setTimeout(main, 5000);
        return;
    }

    const [ channelID ] = channelLink.href.split("/").slice(-1);

    console.log(channelID);
    fetchChannelEmotes(channelID);

    // TODO: replace this with a jquery `$.initialize()`
    setInterval(scanComments, 250);
}

main();
