import { Command, Extension } from '@tiptap/core'
import { AllSelection, TextSelection, Transaction } from '@tiptap/pm/state'

export interface IndentOptions {
  types: string[],
  minLevel: number,
  maxLevel: number,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

const ClassAttrPrefix = 'tt-indent-'

export const Indent = Extension.create<IndentOptions>({
  name: 'indent',

  addOptions() {
    return {
      types: ['heading', 'listItem', 'taskItem', 'paragraph'],
      minLevel: 0,
      maxLevel: 8,
    }
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
                let paddingLength = 40 * attributes.indent
                return {
                  style: `padding-left: ${paddingLength}px`,
                };
              }
              return {};
            },
            parseHTML: element => {
              const padding = element.style.paddingLeft
              return padding ? parseInt(padding) / 40 : 0
            },
          },
        },
      },
    ]
  },

  addCommands() {
    const setNodeIndentMarkup = (tr: Transaction, pos: number, delta: number): Transaction => {
      const node = tr?.doc?.nodeAt(pos)

      if (node) {
        const nextLevel = (node.attrs.indent || 0) + delta
        const { minLevel, maxLevel } = this.options
        let indent = nextLevel

        if (nextLevel < minLevel) {
          indent = minLevel
        } else if (nextLevel > maxLevel) {
          indent = maxLevel
        }

        if (indent !== node.attrs.indent) {
          const { indent: oldIndent, ...currentAttrs } = node.attrs
          const nodeAttrs = indent > minLevel ? { ...currentAttrs, indent } : currentAttrs

          return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks)
        }
      }
      return tr
    }

    const updateIndentLevel = (tr: Transaction, delta: number): Transaction => {
      const { doc, selection } = tr

      if (doc && selection) {
        const { from, to } = selection

        doc.nodesBetween(from, to, (node: any, pos: number) => {
          if (this.options.types.includes(node.type.name)) {
            tr = setNodeIndentMarkup(tr, pos, delta)
            return false
          }

          return true
        })
      }

      return tr
    }
    const applyIndent: (direction: number) => () => Command = direction => () => ({ tr, state, dispatch }) => {
      const { selection } = state

      tr = tr.setSelection(selection)
      tr = updateIndentLevel(tr, direction)

      if (tr.docChanged) {
        dispatch?.(tr)
        return true
      }

      return false
    }

    return {
      indent: applyIndent(1),
      outdent: applyIndent(-1),
    }
  },
})
