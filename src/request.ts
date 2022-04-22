/*
 * request.js
 * Copyright (C) 2022 sandvich <sandvich@artix>
 *
 * Distributed under terms of the GPLv3 license.
 */

interface SevenTVEmote {
    id: string,
    name: string,
    urls: string[][],
}

const emotes: {[name: string]: string} = { }

async function fetchEmotes(apiURL: string) {
    return new Promise<void>((resolve, reject) => {
        // @ts-ignore
        GM.xmlHttpRequest({
            method: "GET",
            url: apiURL,
            headers: {
                "Accept": "application/json"
            },
            responseType: "json",
            onload: (response: XMLHttpRequest) => {
                response.response.forEach((emote: SevenTVEmote) => {
                    emotes[emote.name] = emote.urls[0][1];

                    // Since we updated the emotes list, some comments may not have
                    // the new emotes. Therefore we must clear the list of parsed
                    // comments.
                    parsedComments.clear();
                });

                resolve();
            },
            onerror: (response: XMLHttpRequest) => {
                reject(response);
            }
        });
    });
}

async function fetchChannelEmotes(channelID: string) {
    return await fetchEmotes(`https://api.7tv.app/v2/users/${channelID}/emotes`);
}

async function fetchGlobalEmotes() {
    return await fetchEmotes("https://api.7tv.app/v2/emotes/global");
}
