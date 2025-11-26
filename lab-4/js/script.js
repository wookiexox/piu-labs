const defaultData = {
    todo: [],
    inprogress: [],
    done: []
};

const STORAGE_KEY = 'kanban-data';
let boardData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultData;


const generateId = () => {
    let newId;
    let exists;

    do {
        newId = '_' + Math.random().toString(36).substr(2, 9);

        exists = boardData.todo.some(card => card.id === newId) ||
            boardData.inprogress.some(card => card.id === newId) ||
            boardData.done.some(card => card.id === newId);

    } while (exists);

    return newId;
};

const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 100%, 85%)`;
};

const saveState = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boardData));
    updateCounters();
};

const updateCounters = () => {
    document.querySelectorAll('.column').forEach(column => {
        const colId = column.dataset.id;
        const count = boardData[colId].length;
        column.querySelector('.counter').textContent = `(${count})`;
    });
};


// render

const createCardElement = (cardObj) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.setAttribute('data-id', cardObj.id);
    div.style.backgroundColor = cardObj.color;
    div.innerHTML = `
        <button class="btn-delete" title="Usuń">✕</button>
        <div class="card-content" contenteditable="true">${cardObj.text}</div>
        <div class="card-actions">
            <button class="btn-card btn-prev" title="W lewo">←</button>
            <button class="btn-card btn-color" title="Zmień kolor">🎨</button>
            <button class="btn-card btn-next" title="W prawo">→</button>
        </div>
    `;
    return div;
};

const renderColumn = (colId) => {
    const columnEl = document.querySelector(`.column[data-id="${colId}"] .card-list`);
    columnEl.innerHTML = '';

    boardData[colId].forEach(cardObj => {
        const cardEl = createCardElement(cardObj);
        columnEl.appendChild(cardEl);
    });

    updateCounters();
};

const renderBoard = () => {
    Object.keys(boardData).forEach(colId => renderColumn(colId));
};


// event handling

const handleAddCard = (colId) => {
    const newCard = {
        id: generateId(),
        text: 'Nowe zadanie...',
        color: getRandomColor()
    };
    boardData[colId].push(newCard);
    saveState();
    renderColumn(colId);
};

const handleDeleteCard = (colId, cardId) => {
    if (confirm('Czy na pewno usunąć to zadanie?')) {
        boardData[colId] = boardData[colId].filter(card => card.id !== cardId);
        saveState();
        renderColumn(colId);
    }
};

const handleMoveCard = (currentColId, cardId, direction) => {
    const columnsOrder = ['todo', 'inprogress', 'done'];
    const currentIndex = columnsOrder.indexOf(currentColId);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < columnsOrder.length) {
        const targetColId = columnsOrder[newIndex];
        const cardIndex = boardData[currentColId].findIndex(c => c.id === cardId);
        const [cardToMove] = boardData[currentColId].splice(cardIndex, 1);

        boardData[targetColId].push(cardToMove);
        saveState();
        renderColumn(currentColId);
        renderColumn(targetColId);
    }
};

const handleContentEdit = (colId, cardId, newText) => {
    const card = boardData[colId].find(c => c.id === cardId);
    if (card) {
        card.text = newText;
        saveState();
    }
};

const handleChangeCardColor = (colId, cardId) => {
    const card = boardData[colId].find(c => c.id === cardId);
    if (card) {
        card.color = getRandomColor();
        saveState();
        renderColumn(colId);
    }
};

const handleSortColumn = (colId) => {
    boardData[colId].sort((a, b) => a.text.localeCompare(b.text));
    saveState();
    renderColumn(colId);
};

const handleColorColumn = (colId) => {
    boardData[colId].forEach(card => {
        card.color = getRandomColor();
    });
    saveState();
    renderColumn(colId);
};


document.addEventListener('DOMContentLoaded', () => {
    renderBoard();

    const boardContainer = document.querySelector('.kanban-board');

    boardContainer.addEventListener('click', (e) => {
        const target = e.target;
        const columnEl = target.closest('.column');
        const cardEl = target.closest('.card');

        if (!columnEl) return;

        const colId = columnEl.dataset.id;
        const cardId = cardEl ? cardEl.dataset.id : null;

        if (target.classList.contains('btn-add')) {
            handleAddCard(colId);
        }
        if (target.classList.contains('btn-delete') && cardId) {
            handleDeleteCard(colId, cardId);
        }
        if (target.classList.contains('btn-prev') && cardId) {
            handleMoveCard(colId, cardId, -1);
        }
        if (target.classList.contains('btn-next') && cardId) {
            handleMoveCard(colId, cardId, 1);
        }
        if (target.classList.contains('btn-color') && cardId) {
            handleChangeCardColor(colId, cardId);
        }
        if (target.classList.contains('btn-sort')) {
            handleSortColumn(colId);
        }
        if (target.classList.contains('btn-color-col')) {
            handleColorColumn(colId);
        }
    });

    boardContainer.addEventListener('focusout', (e) => {
        if (e.target.classList.contains('card-content')) {
            const cardEl = e.target.closest('.card');
            const columnEl = e.target.closest('.column');
            if (cardEl && columnEl) {
                const newText = e.target.innerText;
                handleContentEdit(columnEl.dataset.id, cardEl.dataset.id, newText);
            }
        }
    });
});