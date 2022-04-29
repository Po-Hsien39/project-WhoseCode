class Text {
  static clock = 3;
  constructor(user, word, clock) {
    this.clock = clock || Text.clock++;
    this.user = user;
    this.prev = null;
    this.next = null;
    this.content = word;
    this.isDeleted = false;
    this.inGarbage = false;
  }
  static compare(textA, textB) {
    if (
      textA.clock === textB.clock &&
      textA.user === textB.user &&
      textA.content === textB.content
    ) {
      return true;
    }
    return false;
  }
  static correctOrder(textA, textB) {
    if (textA.clock <= textB.clock || textA.user === textB.user) {
      return true;
    }
    return false;
  }
  static updateClock(clock) {
    Text.clock = Math.max(Text.clock, clock);
  }
  toString() {
    return { clock: this.clock, user: this.user, content: this.content };
  }
}

export default Text;
