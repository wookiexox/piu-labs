import { store } from './store.js';

const container = document.getElementById('shapes-container');
const btnAddSquare = document.getElementById('add-square');
const btnAddCircle = document.getElementById('add-circle');
const btnRecolorSquares = document.getElementById('recolor-squares');
const btnRecolorCircles = document.getElementById('recolor-circles');
const countSquareSpan = document.getElementById('count-square');
const countCircleSpan = document.getElementById('count-circle');


const createShapeElement = (shape) => {
    const div = document.createElement('div');
    div.classList.add('shape', shape.type);
    div.style.backgroundColor = shape.color;
    div.dataset.id = shape.id;
    return div;
};

const updateCounters = () => {
    const counts = store.getCounts();
    countSquareSpan.textContent = counts.square;
    countCircleSpan.textContent = counts.circle;
};

const handleStoreUpdate = (state, actionType, payload) => {
    updateCounters();

    switch (actionType) {
        case 'ADD':
            const newEl = createShapeElement(payload);
            container.appendChild(newEl);
            break;

        case 'REMOVE':
            const elToRemove = container.querySelector(`[data-id="${payload}"]`);
            if (elToRemove) elToRemove.remove();
            break;

        case 'RECOLOR':
            const shapesToUpdate = state.shapes.filter(s => s.type === payload);
            shapesToUpdate.forEach(shapeData => {
                const el = container.querySelector(`[data-id="${shapeData.id}"]`);
                if (el) el.style.backgroundColor = shapeData.color;
            });
            break;

        case 'INIT':
            container.innerHTML = '';
            state.shapes.forEach(shape => {
                container.appendChild(createShapeElement(shape));
            });
            break;
    }
};

// event listeners
export const initUI = () => {
    store.subscribe(handleStoreUpdate);

    btnAddSquare.addEventListener('click', () => store.addShape('square'));
    btnAddCircle.addEventListener('click', () => store.addShape('circle'));

    btnRecolorSquares.addEventListener('click', () => store.recolorShapes('square'));
    btnRecolorCircles.addEventListener('click', () => store.recolorShapes('circle'));

    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('shape')) {
            const id = e.target.dataset.id;
            store.removeShape(id);
        }
    });

    store.notify('INIT');
};