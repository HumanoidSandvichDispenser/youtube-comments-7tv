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

    // if we are in the same channel, and emote cache has not grown stale
    if (lastChannelID == channelID && Date.now() < cacheExpireTime) {
        console.log("Fetching cached emotes.");

        // then we will fetch emotes from cache
        await fetchCachedEmotes();

        scanComments(); // comments may have loaded before the script reaches here
        observeComments();
    } else {
        console.log("Fetching new emotes...");

        // otherwise, fetch emotes from 7TV API
        const emotesList = [];
        const channelEmotesPromise = fetchChannelEmotes(channelID);

        // fetch global emotes while waiting for channel emotes
        // use Array.push.apply so we can concat and mutate arrays
        emotesList.push.apply(emotesList, await fetchGlobalEmotes());

        channelEmotesPromise.then(channelEmotes => {
            // channel emotes exist. so let's add them.
            console.log("This YouTube channel is linked to a 7TV account.")
            emotesList.push.apply(emotesList, channelEmotes);
        }).catch((response: GM.Response<any>) => {
            if (response.status == 404) {
                // channel emotes do not exist.
                console.log("This YouTube chnanel is NOT linked to a 7TV account.");

                if (!config.globalEmotesEverywhere) {
                    // clear emotes list if we don't allow global emotes
                    emotesList.splice(0, emotesList.length)
                }
            } else {
                // we don't know wtf happened
                throw response;
            }
        }).finally(() => {
            console.log(`Adding ${emotesList.length} emote(s).`);
            emotesList.forEach(emote => {
                emotes[emote.name] = emote.urls[0][1];
            });

            GM.setValue("lastChannelID", channelID);
            GM.setValue("lastFetchTime", Date.now());
            GM.setValue("cachedEmotes", JSON.stringify(emotes));

            scanComments(); // comments may have loaded before the script reaches here
            observeComments();
        });
    }

    console.log("Reached end of main");
}

unsafeWindow["clearEmoteCache"] = () => {
    GM.setValue("lastFetchTime", 0);
    GM.setValue("cachedEmotes", "{}");
}

main();
