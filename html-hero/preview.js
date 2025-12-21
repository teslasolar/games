// HTML Hero - Preview iframe handling
const Preview = {
    iframe: null,
    status: null,

    init() {
        this.iframe = document.getElementById('preview');
        this.status = document.getElementById('status');
    },

    render(html) {
        try {
            // Create full HTML document
            const fullHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: system-ui, sans-serif;
                            padding: 20px;
                            margin: 0;
                        }
                    </style>
                </head>
                <body>
                    ${html}
                </body>
                </html>
            `;

            // Write to iframe
            this.iframe.srcdoc = fullHTML;
            this.setStatus('Rendered', 'success');

            return true;
        } catch (error) {
            this.setStatus('Error', 'error');
            console.error('Preview error:', error);
            return false;
        }
    },

    setStatus(text, type = '') {
        this.status.textContent = text;
        this.status.className = 'status ' + type;
    },

    getDocument() {
        try {
            return this.iframe.contentDocument || this.iframe.contentWindow.document;
        } catch (e) {
            return null;
        }
    },

    clear() {
        this.iframe.srcdoc = '';
        this.setStatus('Ready');
    }
};
