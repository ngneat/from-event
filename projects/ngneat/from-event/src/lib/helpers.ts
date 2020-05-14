import { Subject } from 'rxjs';
import { finalize, share } from 'rxjs/operators';

import { This, Tokens } from './types';

export function createTokens(propertyKey: string): Tokens {
  const event = Symbol(`event ${propertyKey}`) as any;
  const subject = Symbol(`subject ${propertyKey}`) as any;
  const subscription = Symbol(`subscription ${propertyKey}`) as any;

  return {
    event,
    subject,
    subscription,
  };
}

export function initIfNeeded(instance: This, tokens: Tokens) {
  if (instance[tokens.subject]) {
    return;
  }

  let event$ = new Subject<Event>();

  instance[tokens.subject] = event$.pipe(
    finalize(() => {
      if (instance[tokens.subscription]) {
        instance[tokens.subscription].unsubscribe();
        instance[tokens.subscription] = null;
      }

      event$.complete();
      event$ = null;
      instance[tokens.subject] = null;
    }),
    share()
  ) as typeof event$;
}

export function subscribeToEventIfPossible(instance: This, tokens: Tokens) {
  if (instance[tokens.subscription] || !instance[tokens.event]) {
    return;
  }

  instance[tokens.subscription] = instance[tokens.event].subscribe(instance[tokens.subject]);
}
