import { Extension } from '@tiptap/core';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const Indent = Extension.create({
    name: 'indent',
    addOptions() {
        return {
            types: ['heading', 'listItem', 'taskItem', 'paragraph'],
            minLevel: 0,
            maxLevel: 8,
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    indent: {
                        default: 0,
                        renderHTML: attributes => {
                            if (!attributes.indent) {
                                return {};
                            }
                            if (attributes.indent > this.options.minLevel) {
                                let paddingLength = 40 * attributes.indent;
                                return {
                                    style: `padding-left: ${paddingLength}px`,
                                };
                            }
                            return {};
                        },
                        parseHTML: element => {
                            const padding = element.style.paddingLeft;
                            return padding ? parseInt(padding) / 40 : 0;
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        const setNodeIndentMarkup = (tr, pos, delta) => {
            var _a;
            const node = (_a = tr === null || tr === void 0 ? void 0 : tr.doc) === null || _a === void 0 ? void 0 : _a.nodeAt(pos);
            if (node) {
                const nextLevel = (node.attrs.indent || 0) + delta;
                const { minLevel, maxLevel } = this.options;
                let indent = nextLevel;
                if (nextLevel < minLevel) {
                    indent = minLevel;
                }
                else if (nextLevel > maxLevel) {
                    indent = maxLevel;
                }
                if (indent !== node.attrs.indent) {
                    const _b = node.attrs, currentAttrs = __rest(_b, ["indent"]);
                    const nodeAttrs = indent > minLevel ? Object.assign(Object.assign({}, currentAttrs), { indent }) : currentAttrs;
                    return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
                }
            }
            return tr;
        };
        const updateIndentLevel = (tr, delta) => {
            const { doc, selection } = tr;
            if (doc && selection) {
                const { from, to } = selection;
                doc.nodesBetween(from, to, (node, pos) => {
                    if (this.options.types.includes(node.type.name)) {
                        tr = setNodeIndentMarkup(tr, pos, delta);
                        return false;
                    }
                    return true;
                });
            }
            return tr;
        };
        const applyIndent = direction => () => ({ tr, state, dispatch }) => {
            const { selection } = state;
            tr = tr.setSelection(selection);
            tr = updateIndentLevel(tr, direction);
            if (tr.docChanged) {
                dispatch === null || dispatch === void 0 ? void 0 : dispatch(tr);
                return true;
            }
            return false;
        };
        return {
            indent: applyIndent(1),
            outdent: applyIndent(-1),
        };
    },
});

export { Indent, Indent as default };
//# sourceMappingURL=index.js.map
