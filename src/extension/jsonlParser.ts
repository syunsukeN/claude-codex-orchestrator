export class JsonlParser<T> {
  private buffer = '';

  constructor(private readonly parseLine: (line: string) => T | null) {}

  push(chunk: string): T[] {
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() ?? '';

    const events: T[] = [];
    for (const line of lines) {
      const event = this.parseLine(line);
      if (event) {
        events.push(event);
      }
    }
    return events;
  }

  flush(): T[] {
    const line = this.buffer;
    this.buffer = '';
    const event = this.parseLine(line);
    return event ? [event] : [];
  }
}
