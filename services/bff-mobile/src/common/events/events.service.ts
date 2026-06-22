import { Injectable } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { Subject, Observable, finalize } from 'rxjs';

@Injectable()
export class EventsService {
  private readonly streams = new Map<string, Set<Subject<MessageEvent>>>();

  subscribe(userId: string): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();

    if (!this.streams.has(userId)) {
      this.streams.set(userId, new Set());
    }
    this.streams.get(userId)!.add(subject);

    return subject.asObservable().pipe(
      finalize(() => {
        const set = this.streams.get(userId);
        if (set) {
          set.delete(subject);
          if (set.size === 0) this.streams.delete(userId);
        }
      }),
    );
  }

  emit(userId: string, data: unknown): void {
    this.streams.get(userId)?.forEach((subject) => {
      subject.next({ data } as MessageEvent);
    });
  }

  connectedCount(): number {
    let total = 0;
    this.streams.forEach((set) => (total += set.size));
    return total;
  }
}
