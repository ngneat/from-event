import { Observable, Subject, Subscription } from 'rxjs';

export interface Tokens {
  readonly event: unique symbol;
  readonly subject: unique symbol;
  readonly subscription: unique symbol;
}

declare var tokens: Tokens;

export interface This {
  [tokens.event]: Observable<Event>;
  [tokens.subject]: Subject<Event>;
  [tokens.subscription]: Subscription;
}
