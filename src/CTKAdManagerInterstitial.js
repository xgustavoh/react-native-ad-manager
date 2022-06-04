import { NativeEventEmitter, NativeModules } from 'react-native';
import { createErrorFromErrorData } from './utils';

const { CTKInterstitial } = NativeModules;

const eventEmitter = new NativeEventEmitter(CTKInterstitial);

const eventMap = {
  adLoaded: 'interstitialAdLoaded',
  adFailedToLoad: 'interstitialAdFailedToLoad',
  adOpened: 'interstitialAdOpened',
  adFailedToOpen: 'interstitialAdFailedToOpen',
  adClosed: 'interstitialAdClosed',
};

const _subscriptions = new Map();

const addEventListener = (event, handler) => {
  const mappedEvent = eventMap[event];
  if (mappedEvent) {
    let listener;
    if (event === 'adFailedToLoad' || event === 'adFailedToOpen') {
      listener = eventEmitter.addListener(mappedEvent, (error) =>
        handler(createErrorFromErrorData(error))
      );
    } else {
      listener = eventEmitter.addListener(mappedEvent, handler);
    }
    _subscriptions.set(handler, listener);
    return {
      remove: () => removeEventListener(event, handler),
    };
  } else {
    // eslint-disable-next-line no-console
    console.warn(`Trying to subscribe to unknown event: "${event}"`);
    return {
      remove: () => {},
    };
  }
};

const removeEventListener = (type, handler) => {
  const listener = _subscriptions.get(handler);
  if (!listener) {
    return;
  }
  listener.remove();
  _subscriptions.delete(handler);
};

const removeAllListeners = () => {
  _subscriptions.forEach((listener, key, map) => {
    listener.remove();
    map.delete(key);
  });
};

export default {
  ...CTKInterstitial,
  addEventListener,
  removeEventListener,
  removeAllListeners,
  simulatorId: 'SIMULATOR',
};
