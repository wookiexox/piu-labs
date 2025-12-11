import { generateId, getRandomColor } from './helpers.js';

class Store {
    constructor() {
        const savedState = localStorage.getItem('shapes-app-data');
        this.state = savedState ? JSON.parse(savedState) : { shapes: [] };

        this.observers = [];
    }

    subscribe(observerFunction) {
        this.observers.push(observerFunction);
    }

    notify(actionType, payload = null) {
        localStorage.setItem('shapes-app-data', JSON.stringify(this.state));

        this.observers.forEach(observer => observer(this.state, actionType, payload));
    }

    addShape(type) {
        const newShape = {
            id: generateId(),
            type: type, // 'square' lub 'circle'
            color: getRandomColor()
        };

        this.state.shapes.push(newShape);
        this.notify('ADD', newShape);
    }

    removeShape(id) {
        this.state.shapes = this.state.shapes.filter(shape => shape.id !== id);
        this.notify('REMOVE', id);
    }

    recolorShapes(type) {
        this.state.shapes.forEach(shape => {
            if (shape.type === type) {
                shape.color = getRandomColor();
            }
        });
        this.notify('RECOLOR', type);
    }

    // getters
    getCounts() {
        return {
            square: this.state.shapes.filter(s => s.type === 'square').length,
            circle: this.state.shapes.filter(s => s.type === 'circle').length
        };
    }
}

export const store = new Store();