/*
 * config.ts
 * Copyright (C) 2022 sandvich <sandvich@artix>
 *
 * Distributed under terms of the GPLv3 license.
 */


const config = {
    /**
     * Time, in seconds, for the emote cache to live. If the emote cache is
     * older than the specified value, then the script will fetch channel
     * emotes again, as long as the previous channel visited was the same.
     */
    cacheTTL: 1800,

    /**
     * Enable global emotes in comments sections of any channel, not just those
     * linked to 7TV.
     */
    globalEmotesEverywhere: false,
}
