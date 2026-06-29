const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class FakeElement {
  constructor(id = '') {
    this.id = id;
    this.hidden = id === 'chatbot-panel' || id === 'chatbot-cta';
    this.value = '';
    this.textContent = '';
    this.dataset = {};
    this.children = [];
    this.listeners = {};
    this.attributes = {};
    this.scrollTop = 0;
    this.scrollHeight = 0;
  }

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  appendChild(child) {
    this.children.push(child);
    this.scrollHeight = this.children.length;
  }

  querySelector(selector) {
    if (selector === 'span') {
      if (!this.span) {
        this.span = new FakeElement();
      }
      return this.span;
    }

    return null;
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  closest(selector) {
    return selector === 'button[data-question]' && this.dataset.question ? this : null;
  }

  focus() {}
}

const ids = [
  'chatbot-toggle',
  'chatbot-panel',
  'chatbot-close',
  'chatbot-form',
  'chatbot-input',
  'chatbot-messages',
  'chatbot-quick-replies',
  'chatbot-cta'
];

const elements = Object.fromEntries(ids.map((id) => [id, new FakeElement(id)]));
elements['chatbot-toggle'].span = new FakeElement();
elements['chatbot-cta'].span = new FakeElement();

const documentListeners = {};
const document = {
  getElementById(id) {
    return elements[id] || null;
  },
  createElement() {
    return new FakeElement();
  },
  addEventListener(type, handler) {
    documentListeners[type] = handler;
  }
};

const context = {
  document,
  window: {
    setTimeout(callback) {
      callback();
    }
  }
};

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'chatbot.js'), 'utf8');
vm.runInNewContext(source, context, { filename: 'chatbot.js' });

const submit = (question) => {
  elements['chatbot-input'].value = question;
  elements['chatbot-form'].listeners.submit({ preventDefault() {} });
  return elements['chatbot-messages'].children.at(-1).textContent;
};

elements['chatbot-toggle'].listeners.click();
assert.equal(elements['chatbot-panel'].hidden, false, 'Chat panel should open');
assert.equal(elements['chatbot-toggle'].attributes['aria-expanded'], 'true');

const priceAnswer = submit('Giá các combo bao nhiêu?');
assert.match(priceAnswer, /99\.000đ/);
assert.match(priceAnswer, /249\.000đ/);
assert.match(priceAnswer, /379\.000đ/);
assert.equal(elements['chatbot-cta'].hidden, false);

const fitAnswer = submit('Sản phẩm có phù hợp với mình không?');
assert.match(fitAnswer, /1 chậu/);
assert.match(fitAnswer, /3 chậu/);
assert.match(fitAnswer, /5 chậu/);

const waitAnswer = submit('Để tôi nghĩ thêm');
assert.match(waitAnswer, /không ép mua/);
assert.equal(elements['chatbot-cta'].hidden, false);
assert.equal(elements['chatbot-cta'].span.textContent, 'Để lại góc cần tư vấn');

const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(indexHtml, /id="chatbot-toggle"/);
assert.match(indexHtml, /id="register-section"/);
assert.match(indexHtml, /href="#register-section"/);
assert.match(indexHtml, /<script src="chatbot\.js"><\/script>/);

console.log('PASS: chatbot trả lời đúng 3 tình huống và CTA dẫn đến form.');
