/*
 * main.ts
 * Copyright (C) 2022 sandvich <sandvich@artix>
 *
 * Distributed under terms of the GPLv3 license.
 */

/// <reference path="config.ts" />
/// <reference path="utils.ts" />
/// <reference path="request.ts" />


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
    // with the recent addition of the cache, emotes may load faster than the
    // comments section, so we must wait for the comments section to load if
    // the emotes load in too early
    waitForElement("#comments #sections #contents", 5000).then(comments => {
        commentsObserver.observe(comments, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: false
        });
    }).catch(() => {
        const LOOOOL = "font-size:172px; background:url(https://cdn.7tv.app/emote/60ae4a875d3fdae583c64313/4x) no-repeat;";
        console.error("%c ", LOOOOL);
        throw "Unable to find comments section FeelsDankMan";
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

    const lastChannelID = await GM.getValue("lastChannelID");
    const lastFetchTime = await GM.getValue("lastFetchTime", 0);
    const cacheExpireTime = lastFetchTime + (config.cacheTTL * 1000);

    console.log("Last channel ID was " + lastChannelID);
    console.log("This channel ID was " + channelID);
    console.log(lastChannelID == channelID);
    console.log("The emote cache expires at " + cacheExpireTime);
    console.log("Right now it is " + Date.now());
    console.log(Date.now() < cacheExpireTime);

    GM.getValue("lastChannelID").then(result => {
        console.log("Got result: " + result);
    });

    // if we are in the same channel, and emote cache has not grown stale
    if (lastChannelID == channelID && Date.now() < cacheExpireTime) {
        console.log("Fetching cached emotes.");

        // then we will fetch emotes from cache
        await fetchCachedEmotes();
    } else {
        console.log("Fetching new emotes...");

        // otherwise, fetch emotes from 7TV API
        await fetchChannelEmotes(channelID); // fetch global before channel
        await fetchGlobalEmotes();
        GM.setValue("lastChannelID", channelID);
        GM.setValue("lastFetchTime", Date.now());
        GM.setValue("cachedEmotes", JSON.stringify(emotes));
    }

    scanComments(); // comments may have loaded before the script reaches here
    observeComments();
    console.log("Reached end of main");
}

main();
