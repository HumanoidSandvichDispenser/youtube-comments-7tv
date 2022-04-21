/*
 * main.js
 * Copyright (C) 2022 sandvich <sandvich@artix>
 *
 * Distributed under terms of the GPLv3 license.
 */

/// <reference path="request.ts" />

const parsedComments = new Map();

function scanComments(skipParsedComments = true): void  {
    const comments = document.querySelectorAll(".ytd-comment-renderer#content-text");
    comments.forEach(comment => {
        // if we already parsed emotes for this comment, skip it
        if (skipParsedComments && parsedComments.has(comment)) {
            return;
        }

        placeEmotes(comment);
        parsedComments.set(comment, true);
    });
}

function placeEmotes(comment: Element): void {
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

async function main(): Promise<void> {
    // fetch global emotes before fetching channel emotes
    fetchGlobalEmotes();

    // this is just a hacky way to get the channel ID
    const channelLink: HTMLAnchorElement = document
            .querySelector(".ytd-channel-name .yt-simple-endpoint");

    if (channelLink == undefined || channelLink == null) {
        setTimeout(main, 2500);
        return;
    }

    const [ channelID ] = channelLink.href.split("/").slice(-1);

    console.log(channelID);
    fetchChannelEmotes(channelID);

    setInterval(scanComments, 250);
}

main();
