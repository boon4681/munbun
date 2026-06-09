import { mergeAttributes, Node } from '@tiptap/core'

export default Node.create({
    name: 'munbun-section',
    group: 'block',
    content: 'block*',
    defining: true,
    marks: '',
    selectable: true,
    draggable: true,
    atom: true,

    addAttributes() {
        return {
            backgroundColor: {
                default: "tomato",
            },
        }
    },

    addCommands() {
        return {
            //@ts-ignore
            setMunbunSectionNode: (attrs) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs,
                    content: [{ type: 'paragraph', content: [] }],
                })
            }
        } as any
    },

    parseHTML() {
        return [
            {
                tag: 'munbun-section',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['munbun-section', mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return ({ editor, node, getPos }) => {
            const { view } = editor
            const dom = document.createElement('div')
            dom.classList.add("munbun")
            dom.classList.add("min-h-12")
            dom.classList.add("p-4")
            dom.style.backgroundColor = node.attrs.backgroundColor

            const inner = document.createElement('div')
            dom.appendChild(inner)
            inner.classList.add('is-editable')

            // dom.classList.add('node-view')
            // const button = document.createElement('button')

            // button.innerHTML = `This button has been clicked ${node.attrs.count} times.`
            dom.addEventListener('click', () => {
                console.log("HI")
                if (typeof getPos === 'function') {
                    editor.commands.focus()
                    // view.dispatch(view.state.tr.setNodeMarkup(getPos(), undefined, {
                    //     count: node.attrs.count + 1,
                    // }))
                }
            })

            // dom.append(button)
            return {
                dom,
                contentDOM: dom
            }
        }
    },
})