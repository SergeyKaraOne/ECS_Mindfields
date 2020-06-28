let noteIdCounter = 0;
let columnIdCounter = 0;
let draggedNote = null;

// --------------------------------------------------------------

document
    .querySelectorAll('.column')
    .forEach(columnProcess)

// --------------------------------------------------------------

document
    .querySelectorAll('.note')
    .forEach(noteProcess)

// --------------------------------------------------------------
// создание новой колонки (column)

document
    .querySelector('[data-action-addColumn]')
    .addEventListener('click', function (event) {
        columnIdCounter++
        const columnElement = document.createElement('div')
        columnElement.classList.add('column')
        columnElement.setAttribute('draggable', 'true')
        columnElement.setAttribute('data-column-id', columnIdCounter)
        columnElement.innerHTML =
            `<p class="column-header">
                <span>название столбца</span>
            </p>
            <div data-notes>
            </div>
            <p class="column-footer">
                <span data-action-addNote class="action">+ Добавить карточку</span>
            </p>`
        document.querySelector('.columns').append(columnElement)
        columnProcess(columnElement)
    })

// --------------------------------------------------------------
// создание новой карточки (note)

function columnProcess(columnElement) {
    const spanAction_addNote = columnElement.querySelector('[data-action-addNote]')
    spanAction_addNote.addEventListener('click', function (event) {
        noteIdCounter++
        const noteElement = document.createElement('div')
        noteElement.classList.add('note')
        noteElement.setAttribute('draggable', 'true')
        noteElement.setAttribute('data-note-id', noteIdCounter)
        columnElement.querySelector('[data-notes]').append(noteElement)
        noteProcess(noteElement)

        noteElement.setAttribute('contenteditable', 'true')
        noteElement.focus()
    })

    // --------------------------------------------------------------
    // редактирование заголовка колонки (header)

    const headerElement = columnElement.querySelector('.column-header')
    // headerProcess(headerElement)
    // function headerProcess(headerElement) {
    headerElement.addEventListener('dblclick', function (event) {
        headerElement.setAttribute('contenteditable', 'true')
        headerElement.focus()
    })
    headerElement.addEventListener('blur', function (event) {
        headerElement.removeAttribute('contenteditable')
    })
    // }

    // --------------------------------------------------------------
    //  прослушка стобцов за пределами карточек или без них вообще (column)

    columnElement.addEventListener('dragover', function (event) {
        event.preventDefault()
    })

    columnElement.addEventListener('drop', function (event) {
        event.preventDefault() // без этого Firefox перебрасывает на https://www.anything.com/
        if (draggedNote) {
            return columnElement.querySelector('[data-notes]').append(draggedNote)
        }
    })
}

// --------------------------------------------------------------
// редактирование карточек (note)

function noteProcess(noteElement) {
    noteElement.addEventListener('dblclick', function (event) {
        noteElement.setAttribute('contenteditable', 'true')
        noteElement.removeAttribute('draggable')
        noteElement.closest('.column').removeAttribute('draggable')
        noteElement.focus()
    })
    noteElement.addEventListener('blur', function (event) {
        noteElement.removeAttribute('contenteditable')
        noteElement.setAttribute('draggable', 'true')
        noteElement.closest('.column').setAttribute('draggable', 'true')

        // --------------------------------------------------------------
        // удаление пустых карточек и "откат" их счётчика (note)

        if (!noteElement.textContent.trim().length) {

            let deleteIdElement = noteElement.getAttribute('data-note-id')
            if (deleteIdElement !== noteIdCounter) {

                let lastElement = document.querySelectorAll('[data-note-id]')[0]
                let lastIdElement = + lastElement.getAttribute('data-note-id')

                for (let index = 1; index < noteIdCounter; index++) {
                    let indexElement = document.querySelectorAll('[data-note-id]')[index]
                    let indexIdElement = + indexElement.getAttribute('data-note-id')
                    if (indexIdElement > lastIdElement) {
                        lastIdElement = indexIdElement
                        lastElement = indexElement
                    }
                }
                lastElement.setAttribute('data-note-id', deleteIdElement)
            }
            noteElement.remove() // original
            noteIdCounter--
        }
    })

    // --------------------------------------------------------------
    // прослушка карточек на "перемещение" (note)

    noteElement.addEventListener('dragstart', dragstart_noteHandler)
    noteElement.addEventListener('dragend', dragend_noteHandler)
    noteElement.addEventListener('dragenter', dragenter_noteHandler)
    noteElement.addEventListener('dragleave', dragleave_noteHandler)
    noteElement.addEventListener('dragover', dragover_noteHandler)
    noteElement.addEventListener('drop', drop_noteHandler)

}

// --------------------------------------------------------------
// функции для перемещения карточек (note)

function dragstart_noteHandler(event) {
    event.dataTransfer.setData('text', 'anything'); // исправление для Firefox
    draggedNote = this
    this.classList.add('dragged')
    // event.stopPropagation() // test_header вернуть habr вроде бы ничего не меняет
}

function dragend_noteHandler(event) {
    draggedNote = null
    this.classList.remove('dragged')

    document
        .querySelectorAll('.note')
        .forEach(x => x.classList.remove('under'))
}

function dragenter_noteHandler(event) {
    if (this === draggedNote) {
        return
    }
    this.classList.add('under')
}

function dragleave_noteHandler(event) {
    if (this === draggedNote) {
        return
    }
    this.classList.remove('under') // нужно ли см. dragend
}

function dragover_noteHandler(event) {
    if (this === draggedNote) {
        return
    }
    event.preventDefault() // без этого не вставляется в слот
}

function drop_noteHandler(event) {
    if (this === draggedNote) {
        return
    }
    event.preventDefault()  // без этого Firefox перебрасывает на https://www.anything.com/
    event.stopPropagation() // test_header без этого ВСЕГДА вставляется ниже футера

    if (this.parentElement === draggedNote.parentElement) {
        const note = Array.from(this.parentElement.querySelectorAll('.note'))
        const indexA = note.indexOf(draggedNote)
        const indexB = note.indexOf(this)
        if (indexA > indexB) {
            this.parentElement.insertBefore(draggedNote, this)
        } else {
            this.parentElement.insertBefore(draggedNote, this.nextElementSibling)
        }
    } else {
        this.parentElement.insertBefore(draggedNote, this)
    }
}

// --------------------------------------------------------------

