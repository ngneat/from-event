import { ElementRef, QueryList } from '@angular/core';
import { fromEvent, merge, defer } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

import { createTokens, initIfNeeded, subscribeToEventIfPossible } from './helpers';
import { This } from './types';

export function FromEvents<K extends keyof DocumentEventMap>(event: K, eventOptions?: AddEventListenerOptions) {
  return function (target: any, propertyKey: string) {
    const tokens = createTokens(propertyKey);

    Object.defineProperty(target, propertyKey, {
      set(this: This, list: QueryList<ElementRef>) {
        initIfNeeded(this, tokens);

        if (this[tokens.event]) {
          return;
        }

        this[tokens.event] = list.changes.pipe(
          startWith(list.toArray()),
          switchMap((elements: Array<ElementRef>) => {
            const elements$ = elements.map(({ nativeElement }) => {
              return fromEvent<Event>(nativeElement, event, eventOptions);
            });

            return merge(...elements$);
          })
        );

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
