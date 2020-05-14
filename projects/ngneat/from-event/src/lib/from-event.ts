import { ElementRef } from '@angular/core';
import { fromEvent, defer } from 'rxjs';

import { createTokens, initIfNeeded, subscribeToEventIfPossible } from './helpers';
import { This } from './types';

export function FromEvent<K extends keyof DocumentEventMap>(event: K, eventOptions?: AddEventListenerOptions) {
  return function (target: any, propertyKey: string) {
    const tokens = createTokens(propertyKey);

    Object.defineProperty(target, propertyKey, {
      set(this: This, elementRef?: ElementRef) {
        initIfNeeded(this, tokens);

        if (this[tokens.subscription]) {
          this[tokens.subscription].unsubscribe();
          this[tokens.subscription] = null;
        }

        if (!elementRef) {
          this[tokens.event] = null;

          return;
        }

        this[tokens.event] = fromEvent(elementRef.nativeElement, event, eventOptions);
        subscribeToEventIfPossible(this, tokens);
      },
      get(this: This) {
        return defer(() => {
          initIfNeeded(this, tokens);
          subscribeToEventIfPossible(this, tokens);

          return this[tokens.subject];
        });
      },
    });
  };
}
