/*
 * request.ts
 * Copyright (C) 2022 sandvich <sandvich@artix>
 *
 * Distributed under terms of the GPLv3 license.
 */

interface SevenTVEmote {
    id: string,
    name: string,
    urls: string[][],
}

var emotes: {[name: string]: string} = { }

async function fetchEmotes(apiURL: string) {
    console.log("Making request...");
    return new Promise<void>((resolve, reject) => {
        GM.xmlHttpRequest({
            method: "GET",
            url: apiURL,
            headers: {
                "Accept": "application/json"
            },
            // @ts-ignore: apparently @types/greasemonkey doesn't include this
            // property in GM.Request when it should
            responseType: "json",
            onload: (response) => {
                response.response.forEach((emote: SevenTVEmote) => {
                    emotes[emote.name] = emote.urls[0][1];
                });

                resolve();
            },
            onerror: (response) => {
                reject(response);
            }
        });
    });
}

async function fetchChannelEmotes(channelID: string) {
    await fetchEmotes(`https://api.7tv.app/v2/users/${channelID}/emotes`);
}

async function fetchGlobalEmotes() {
    await fetchEmotes("https://api.7tv.app/v2/emotes/global");
}

async function fetchCachedEmotes() {
    const cachedEmotesJSON = await GM.getValue("cachedEmotes");
    if (typeof cachedEmotesJSON == "string") {
        emotes = JSON.parse(cachedEmotesJSON);
    }
}
