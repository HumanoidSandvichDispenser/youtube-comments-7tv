/*
 * main.js
 * Copyright (C) 2022 sandvich <sandvich@artix>
 *
 * Distributed under terms of the GPLv3 license.
 */

/// <reference path="request.ts" />

/**
 * @deprecated This function's purpose has been replaced by MutationObserver
 */
function scanComments(): void  {
    const comments = document.querySelectorAll(".ytd-comment-renderer#content-text");
    comments.forEach(comment => {
        placeEmotes(comment);
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

function recursivelyParseNodes(node: Node): void {
    if (node.nodeType == Node.ELEMENT_NODE) {
        const children = node.childNodes;
        const element = node as Element;

        // text inside multiple style tags will now be parsed for emotes
        children.forEach(child => {
            recursivelyParseNodes(child);
        });

        placeEmotes(element);
    }
}

const commentsObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType == Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                if (element.matches(".ytd-comment-renderer#content-text")) {
                    recursivelyParseNodes(node);
                }
            }
        });
    });
});

async function observeComments(): Promise<void> {
    const comments = document.querySelector("#comments #sections #contents");
    commentsObserver.observe(comments, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: false
    });
}

async function main(): Promise<void> {
    // this is just a hacky way to get the channel ID
    const channelLink: HTMLAnchorElement = document
            .querySelector(".ytd-channel-name .yt-simple-endpoint");

    if (channelLink == undefined || channelLink == null) {
        setTimeout(main, 2500);
        return;
    }

    const [ channelID ] = channelLink.href.split("/").slice(-1);

    console.log(channelID);

    // fetch global emotes before fetching channel emotes
    await fetchGlobalEmotes();
    await fetchChannelEmotes(channelID);

    observeComments();
}

main();
