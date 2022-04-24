/*
 * config.ts
 * Copyright (C) 2022 sandvich <sandvich@artix>
 *
 * Distributed under terms of the GPLv3 license.
 */


/**
 * Waits for an element to exist in the DOM.
 * @param selector The CSS selector to find the element by
 * @param timeout The maximum time in milliseconds to wait for the element if
 * the timeout is greater than 0
 * @returns The element waited on
 */
async function waitForElement(selector: string, timeout: number = -1):
        Promise<Element> {
    return new Promise((resolve, reject) => {
        let timeoutTimer: NodeJS.Timeout;
        const foundElement = document.querySelector(selector);
        if (foundElement != undefined)
            return resolve(foundElement);

        const observer = new MutationObserver(() => {
            let foundElement = document.querySelector(selector);
            if (foundElement != undefined) {
                observer.disconnect();
                resolve(foundElement);
                if (timeoutTimer != undefined) {
                    clearTimeout(timeoutTimer);
                }
            }
        });

        if (timeout > 0) {
            timeoutTimer = setTimeout(() => {
                observer.disconnect();
                reject();
            }, timeout);
        }

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}
