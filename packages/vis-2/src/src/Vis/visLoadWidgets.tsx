/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2024 Denis Haev https://github.com/GermanBluefox,
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */
import { I18n, type LegacyConnection } from '@iobroker/adapter-react-v5';
import type VisRxWidget from '@/Vis/visRxWidget';
import { Branded } from '@/types';

export type WidgetSetName = Branded<string, 'WidgetSetName'>;
export type PromiseName = `_promise_${WidgetSetName}`;
declare global {
    interface Window {
        [promiseName: PromiseName]: Promise<any>;
        [widgetSetName: WidgetSetName]: {
            __initialized: boolean;
            get: (module: string) => () => void;
            init?: (shareScope: any) => Promise<void>;
        };
    }
}
const getOrLoadRemote = (remote: string, shareScope: string | { default: any }, remoteFallbackUrl?: string): Promise<null> => {
    // @ts-expect-error todo fix
    window[`_promise_${remote}`] = window[`_promise_${remote}`] || new Promise((resolve, reject) => {
        // check if remote exists on window
        // search dom to see if remote tag exists, but might still be loading (async)
        const existingRemote = document.querySelector(`[data-webpack="${remote}"]`);
        // when remote is loaded...
        const onload = async () => {
            // check if it was initialized
            // @ts-expect-error todo fix
            if (!window[remote]) {
                if (remoteFallbackUrl && (remoteFallbackUrl.startsWith('http://') || remoteFallbackUrl.startsWith('https://'))) {
                    console.error(`Cannot load remote from url "${remoteFallbackUrl}"`);
                } else {
                    reject(new Error(`Cannot load ${remote} from ${remoteFallbackUrl}`));
                }
                resolve(null);
                return;
            }
            // @ts-expect-error todo fix
            if (!window[remote].__initialized) {
                // if share scope doesn't exist (like in webpack 4) then expect shareScope to be a manual object
                // eslint-disable-next-line camelcase
                // @ts-expect-error this is a trick
                if (typeof __webpack_share_scopes__ === 'undefined' && window[remote].init) {
                    // use the default share scope object, passed in manually
                    // @ts-expect-error todo fix
                    await window[remote].init((shareScope as { default: any })?.default);
                    // @ts-expect-error todo fix
                } else if (window[remote].init) {
                    // otherwise, init share scope as usual

                    try {
                        // eslint-disable-next-line camelcase, no-undef
                        // @ts-expect-error this is a trick
                        await window[remote].init(__webpack_share_scopes__[shareScope]);
                    } catch (e) {
                        console.error(`Cannot init remote "${remote}" with "${shareScope}"`);
                        console.error(e);
                        reject(new Error(`Cannot init remote "${remote}" with "${shareScope}"`));
                        reject(e);
                        return;
                    }
                } else {
                    reject(new Error(`Remote init function not found for ${remote} from ${remoteFallbackUrl}`));
                    return;
                }
                // mark remote as initialized
                // @ts-expect-error todo fix
                window[remote].__initialized = true;
            }
            // resolve promise so marking remote as loaded
            resolve(null);
        };
        if (existingRemote) {
            console.warn(`SOMEONE IS LOADING THE REMOTE ${remote}`);
            // if existing remote but not loaded, hook into its onload and wait for it to be ready
            // existingRemote.onload = onload;
            // existingRemote.onerror = reject;
            resolve(null);
            // check if remote fallback exists as param passed to function
            // TODO: should scan public config for a matching key if no override exists
        } else if (remoteFallbackUrl) {
            // inject remote if a fallback exists and call the same onload function
            const d = document;
            const script = d.createElement('script');
            script.type = 'text/javascript';
            // mark as data-webpack so runtime can track it internally
            script.setAttribute('data-webpack', `${remote}`);
            script.async = true;
            script.onerror = () => {
                if (!remoteFallbackUrl.includes('iobroker.net')) {
                    reject(new Error(`Cannot load ${remote} from ${remoteFallbackUrl}`));
                } else {
                    resolve(null);
                }
            };
            script.onload = onload;
            script.src = remoteFallbackUrl;
            d.getElementsByTagName('head')[0].appendChild(script);
        } else {
            // no remote and no fallback exist, reject
            reject(new Error(`Cannot Find Remote ${remote} to inject`));
        }
    });

    // @ts-expect-error todo fix
    return window[`_promise_${remote}`];
};

export const loadComponent = (remote: WidgetSetName, sharedScope: string, module: string, url: string): (() => any) =>
    () => getOrLoadRemote(remote, sharedScope, url)
        .then(() => window[remote] && window[remote].get(module))
        .then(factory => factory && factory());

function registerWidgetsLoadIndicator(cb: (process: number, max: number) => void) {
    window.__widgetsLoadIndicator = cb;
}

interface VisLoadComponentContext {
    visWidgetsCollection: ioBroker.VisWidget;
    countRef: { count: number; max: number };
    dynamicWidgetInstance: ioBroker.InstanceObject;
    i18nPrefix: string;
    // List of custom React components
    result: VisRxWidget<any>[];
}

function _loadComponentHelper(context: VisLoadComponentContext): Promise<void[]> {
    // expected in context
    // visWidgetsCollection
    // countRef
    // dynamicWidgetInstance
    // i18nPrefix
    // result
    const promises: Promise<void>[] = [];

    for (let i = 0; i < context.visWidgetsCollection.components.length; i++) {
        ((index: number, _visWidgetsCollection) => {
            context.countRef.max++;

            // @ts-expect-error todo fix
            const promise = loadComponent(_visWidgetsCollection.name, 'default', `./${_visWidgetsCollection.components[index]}`, _visWidgetsCollection.url)()
                .then((CustomComponent: any) => {
                    context.countRef.count++;

                    if (CustomComponent.default) {
                        CustomComponent.default.adapter = context.dynamicWidgetInstance._id.substring('system.adapter.'.length).replace(/\.\d*$/, '');
                        CustomComponent.default.version = context.dynamicWidgetInstance.common.version;
                        CustomComponent.default.url = _visWidgetsCollection.url;
                        if (context.i18nPrefix) {
                            CustomComponent.default.i18nPrefix = context.i18nPrefix;
                        }
                        context.result.push(CustomComponent.default);
                    } else {
                        console.error(`Cannot load widget ${context.dynamicWidgetInstance._id}. No default found`);
                    }
                    window.__widgetsLoadIndicator && window.__widgetsLoadIndicator(context.countRef.count, context.countRef.max);
                })
                .catch((e: any) => {
                    console.error(`Cannot load widget ${context.dynamicWidgetInstance._id}: ${e.toString()}`);
                    console.error(`Cannot load widget ${context.dynamicWidgetInstance._id}: ${JSON.stringify(e)}`);
                });

            promises.push(promise);
        })(i, context.visWidgetsCollection);
    }

    return Promise.all(promises);
}

function getText(text: string | ioBroker.StringOrTranslated): string {
    if (typeof text === 'object') {
        return text[I18n.getLanguage()] || text.en || '';
    }
    return (text || '').toString();
}

/* Do not make this funktion async, because is optimized to simultaneously load the widget sets */
function getRemoteWidgets(socket: LegacyConnection, onlyWidgetSets?: false | string[]): Promise<void | VisRxWidget<any>[]> {
    return socket.getObjectViewSystem(
        'instance',
        'system.adapter.',
        'system.adapter.\u9999',
    )
        .then(objects => {
            const result: VisRxWidget<any>[] = [];
            const countRef = { count: 0, max: 0 };
            const instances: ioBroker.InstanceObject[] = Object.values(objects as Record<string, ioBroker.InstanceObject>);
            const dynamicWidgetInstances: ioBroker.InstanceObject[] = instances.filter(obj  => {
                if (!(obj as ioBroker.InstanceObject).common.visWidgets) {
                    return false;
                }
                const ignoreVersions: number[] = ((obj as ioBroker.InstanceObject).common.visWidgets as any).ignoreInVersions || [];
                return !ignoreVersions.includes(2) &&
                    (!onlyWidgetSets || onlyWidgetSets.includes(getText((obj as ioBroker.InstanceObject).common.name)));
            });

            const promises: Promise<void[] | void | null>[] = [];
            for (let i = 0; i < dynamicWidgetInstances.length; i++) {
                const dynamicWidgetInstance = dynamicWidgetInstances[i];
                for (const widgetSetName in dynamicWidgetInstance.common.visWidgets) {
                    // deprecated
                    if (widgetSetName === 'i18n') {
                        // ignore
                        // find first widget set that is not i18n
                        const _widgetSetName = Object.keys(dynamicWidgetInstance.common.visWidgets).find(name => name !== 'i18n');
                        console.warn(`common.visWidgets.i18n is deprecated. Use common.visWidgets.${_widgetSetName}.i18n instead.`);
                    } else {
                        const visWidgetsCollection: ioBroker.VisWidget = dynamicWidgetInstance.common.visWidgets[widgetSetName];
                        if (!visWidgetsCollection.url?.startsWith('http')) {
                            visWidgetsCollection.url = `./widgets/${visWidgetsCollection.url}`;
                        }
                        if (visWidgetsCollection.components) {
                            ((collection, instance) => {
                                try {
                                    let i18nPrefix = '';
                                    let i18nPromiseWait: Promise<void | null> | undefined;

                                    // 1. Load language file ------------------
                                    // instance.common.visWidgets.i18n is deprecated
                                    if (collection.url && collection.i18n === true) {
                                        // load i18n from files
                                        const pos = collection.url.lastIndexOf('/');
                                        let i18nURL: string;
                                        if (pos !== -1) {
                                            i18nURL = collection.url.substring(0, pos);
                                        } else {
                                            i18nURL = collection.url;
                                        }
                                        const lang = I18n.getLanguage();

                                        i18nPromiseWait = fetch(`${i18nURL}/i18n/${lang}.json`)
                                            .then(data => data.json())
                                            .then(json => {
                                                countRef.count++;
                                                I18n.extendTranslations(json, lang);
                                                window.__widgetsLoadIndicator && window.__widgetsLoadIndicator(countRef.count, promises.length);
                                            })
                                            .catch(error => {
                                                if (lang !== 'en') {
                                                    // try to load English
                                                    return fetch(`${i18nURL}/i18n/en.json`)
                                                        .then(data => data.json())
                                                        .then(json => {
                                                            countRef.count++;
                                                            I18n.extendTranslations(json, lang);
                                                            window.__widgetsLoadIndicator && window.__widgetsLoadIndicator(countRef.count, promises.length);
                                                        })
                                                        .catch(_error => console.log(`Cannot load i18n "${i18nURL}/i18n/${lang}.json": ${_error}`));
                                                }
                                                console.log(`Cannot load i18n "${i18nURL}/i18n/${lang}.json": ${error}`);
                                                return null;
                                            });
                                        promises.push(i18nPromiseWait);
                                    } else if (collection.url && collection.i18n === 'component') {
                                        // instance.common.visWidgets.i18n is deprecated
                                        // @ts-expect-error todo fix
                                        i18nPromiseWait = loadComponent(collection.name, 'default', './translations', collection.url)()
                                            .then((translations: any) => {
                                                countRef.count++;

                                                // add automatic prefix to all translations
                                                if (translations.default.prefix === true) {
                                                    translations.default.prefix = `${instance.common.name}_`;
                                                }
                                                i18nPrefix = translations.default.prefix;

                                                I18n.extendTranslations(translations.default);
                                                window.__widgetsLoadIndicator && window.__widgetsLoadIndicator(countRef.count, promises.length);
                                            })
                                            .catch((error: string) =>
                                                console.log(`Cannot load i18n "${collection.name}": ${error}`));
                                    } else if (collection.i18n && typeof collection.i18n === 'object') {
                                        try {
                                            I18n.extendTranslations(collection.i18n);
                                        } catch (error) {
                                            console.error(`Cannot import i18n: ${error}`);
                                        }
                                    }

                                    // 2. Load all components ------------------
                                    if (collection.components) {
                                        if (i18nPromiseWait) {
                                            // we must wait for it as the flag i18nPrefix will be used in the component
                                            promises.push(i18nPromiseWait
                                                .then(() => _loadComponentHelper({
                                                    visWidgetsCollection: collection,
                                                    countRef,
                                                    dynamicWidgetInstance: instance,
                                                    i18nPrefix,
                                                    result,
                                                })));
                                        } else {
                                            // do not wait for languages
                                            promises.push(_loadComponentHelper({
                                                visWidgetsCollection: collection,
                                                countRef,
                                                dynamicWidgetInstance: instance,
                                                i18nPrefix,
                                                result,
                                            }));
                                        }
                                    } else if (i18nPromiseWait) {
                                        promises.push(i18nPromiseWait);
                                    }
                                } catch (e) {
                                    console.error(e);
                                }
                            })(visWidgetsCollection, dynamicWidgetInstance);
                        }
                    }
                }
            }

            return Promise.all(promises)
                .then(() => result);
        })
        .catch(e => console.error('Cannot read instances', e));
}

export {
    getRemoteWidgets,
    registerWidgetsLoadIndicator,
};
