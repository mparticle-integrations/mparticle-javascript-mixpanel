Object.defineProperty(exports, '__esModule', { value: true });

/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
}

/* eslint-disable no-undef*/
//  Copyright 2015 mParticle, Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
    

    var name = 'MixpanelEventForwarder',
        moduleId = 10,
        MessageType = {
            SessionStart: 1,
            SessionEnd  : 2,
            PageView    : 3,
            PageEvent   : 4,
            CrashReport : 5,
            OptOut      : 6,
            Commerce    : 16
        };


    var constructor = function () {
        var self = this,
            isInitialized = false,
            forwarderSettings = null,
            reportingService = null;

        self.name = name;

        function initForwarder(settings, service, testMode) {
            forwarderSettings = settings;
            reportingService = service;

            try {
                if (!testMode) {
                    /* eslint-disable */
                    (function(e,b){if (!b.__SV){var a,f,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)));};}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
                    for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d]);};b.__SV=1.2;a=e.createElement("script");a.type="text/javascript";a.async=!0;a.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";f=e.getElementsByTagName("script")[0];f.parentNode.insertBefore(a,f);}})(document,window.mixpanel||[]);
                    /* eslint-enable */
                    mixpanel.init(settings.token, {}, 'mparticle');
                }

                isInitialized = true;

                return 'Successfully initialized: ' + name;
            }
            catch (e) {
                return 'Can\'t initialize forwarder: ' + name + ': ' + e;
            }
        }

        function processEvent(event) {
            var reportEvent = false;

            if (!isInitialized) {
                return 'Can\'t send to forwarder: ' + name + ', not initialized';
            }

            try {
                if (event.EventDataType == MessageType.PageEvent) {
                    reportEvent = true;
                    logEvent(event);
                }
                else if (event.EventDataType == MessageType.PageView) {
                    event.EventName = 'Viewed ' + event.EventName;
                    reportEvent = true;
                    logEvent(event);
                }
                else if (event.EventDataType == MessageType.Commerce &&
                    event.ProductAction &&
                    event.ProductAction.ProductActionType == mParticle.ProductActionType.Purchase) {

                    reportEvent = true;
                    logCommerceEvent(event);
                }

                if (reportEvent &&
                    reportingService) {

                    reportingService(self, event);
                }

                return 'Successfully sent to forwarder: ' + name;
            }
            catch (e) {
                return 'Can\'t send to forwarder: ' + name + ' ' + e;
            }
        }

        function setUserIdentity(id, type) {
            if (!id) {
                return 'Can\'t call setUserIdentity on forwarder: ' + name + ' without ID';
            }

            if (!isInitialized) {
                return 'Can\'t call setUserIdentity on forwarder: ' + name + ', not initialized';
            }

            try {
                if (window.mParticle.IdentityType.Alias == type) {
                    mixpanel.mparticle.alias(id.toString());
                }
                else {
                    mixpanel.mparticle.identify(id.toString());
                }

                return 'Successfully called identify on forwarder: ' + name;
            }
            catch (e) {
                return 'Can\'t call identify on forwarder: ' + name + ': ' + e;
            }
        }

        function setUserAttribute(key, value) {
            var attr = {};
            attr[key] = value;

            try {
                if (forwarderSettings.useMixpanelPeople) {
                    mixpanel.mparticle.people.set(attr);
                } else {
                    mixpanel.mparticle.register(attr);
                }
            }
            catch(e) {
                return 'Can\'t call register on forwarder: ' + name + ': ' + e;
            }
        }

        function removeUserAttribute(attribute) {
            try {
                if (forwarderSettings.useMixpanelPeople) {
                    mixpanel.mparticle.people.unset(attribute);
                } else {
                    mixpanel.mparticle.unregister(attribute);
                }
            }
            catch(e) {
                return 'Can\'t call unregister on forwarder: ' + name + ': ' + e;
            }
        }

        function logEvent(event) {
            event.EventAttributes = event.EventAttributes || {};

            try {
                mixpanel.mparticle.track(
                    event.EventName,
                    event.EventAttributes);
            }
            catch(e) {
                return 'Can\'t log event on forwarder: ' + name + ': ' + e;
            }
        }

        function logCommerceEvent(event) {
            if (!forwarderSettings.useMixpanelPeople) {
                return 'Can\'t log commerce event on forwarder: ' + name + ', useMixpanelPeople flag is not set';
            }

            try {
                mixpanel.mparticle.people.track_charge(event.ProductAction.TotalAmount, {'$time': new Date().toISOString()});
            }
            catch (e) {
                return 'Can\'t log commerce event on forwarder: ' + name + ': ' + e;
            }
        }

        this.init = initForwarder;
        this.process = processEvent;
        this.setUserAttribute = setUserAttribute;
        this.setUserIdentity = setUserIdentity;
        this.removeUserAttribute = removeUserAttribute;
    };

    function getId() {
        return moduleId;
    }

    function register(config) {
        if (!config) {
            window.console.log('You must pass a config object to register the kit ' + name);
            return;
        }

        if (!isObject(config)) {
            window.console.log('\'config\' must be an object. You passed in a ' + typeof config);
            return;
        }

        if (isObject(config.kits)) {
            config.kits[name] = {
                constructor: constructor
            };
        } else {
            config.kits = {};
            config.kits[name] = {
                constructor: constructor
            };
        }
        window.console.log('Successfully registered ' + name + ' to your mParticle configuration');
    }

    if (window && window.mParticle && window.mParticle.addForwarder) {
        window.mParticle.addForwarder({
            name: name,
            constructor: constructor,
            getId: getId
        });
    }

    var MixpanelEventForwarder = {
        register: register
    };
var MixpanelEventForwarder_1 = MixpanelEventForwarder.register;

exports.default = MixpanelEventForwarder;
exports.register = MixpanelEventForwarder_1;
