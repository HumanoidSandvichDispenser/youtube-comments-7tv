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

const emotes = {

}

function fetchChannelEmotes(channelID: string) {
    // @ts-ignore
    GM.xmlHttpRequest({
        method: "GET",
        url: `https://api.7tv.app/v2/users/${channelID}/emotes`,
        headers: {
            "Accept": "application/json"
        },
        responseType: "json",
        onload: function(response: XMLHttpRequest) {
            response.response.forEach((emote: SevenTVEmote) => {
                emotes[emote.name] = emote.urls[0][1];
            });
            scanComments();
        }
    });
}
