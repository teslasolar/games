// HTML Hero - Editor functionality
const Editor = {
    textarea: null,
    lineNumbers: null,

    init() {
        this.textarea = document.getElementById('editor');
        this.lineNumbers = document.getElementById('line-numbers');

        this.textarea.addEventListener('input', () => this.updateLineNumbers());
        this.textarea.addEventListener('scroll', () => this.syncScroll());
        this.textarea.addEventListener('keydown', (e) => this.handleKeydown(e));

        this.updateLineNumbers();
    },

    getValue() {
        return this.textarea.value;
    },

    setValue(code) {
        this.textarea.value = code;
        this.updateLineNumbers();
    },

    updateLineNumbers() {
        const lines = this.textarea.value.split('\n').length;
        let nums = '';
        for (let i = 1; i <= Math.max(lines, 15); i++) {
            nums += i + '\n';
        }
        this.lineNumbers.textContent = nums;
    },

    syncScroll() {
        this.lineNumbers.scrollTop = this.textarea.scrollTop;
    },

    handleKeydown(e) {
        // Tab support
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.textarea.selectionStart;
            const end = this.textarea.selectionEnd;
            const value = this.textarea.value;

            this.textarea.value = value.substring(0, start) + '  ' + value.substring(end);
            this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
            this.updateLineNumbers();
        }

        // Auto-close tags
        if (e.key === '>') {
            setTimeout(() => this.autoCloseTag(), 0);
        }

        // Auto-close quotes
        if (e.key === '"' || e.key === "'") {
            e.preventDefault();
            const start = this.textarea.selectionStart;
            const value = this.textarea.value;
            this.textarea.value = value.substring(0, start) + e.key + e.key + value.substring(start);
            this.textarea.selectionStart = this.textarea.selectionEnd = start + 1;
        }
    },

    autoCloseTag() {
        const value = this.textarea.value;
        const pos = this.textarea.selectionStart;

        // Find the tag that was just closed
        const before = value.substring(0, pos);
        const match = before.match(/<(\w+)[^>]*>$/);

        if (match) {
            const tagName = match[1].toLowerCase();
            const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link'];

            if (!selfClosing.includes(tagName)) {
                const closeTag = `</${tagName}>`;
                this.textarea.value = value.substring(0, pos) + closeTag + value.substring(pos);
                this.textarea.selectionStart = this.textarea.selectionEnd = pos;
                this.updateLineNumbers();
            }
        }
    },

    focus() {
        this.textarea.focus();
    },

    insertAtCursor(text) {
        const start = this.textarea.selectionStart;
        const value = this.textarea.value;
        this.textarea.value = value.substring(0, start) + text + value.substring(start);
        this.textarea.selectionStart = this.textarea.selectionEnd = start + text.length;
        this.updateLineNumbers();
    }
};
