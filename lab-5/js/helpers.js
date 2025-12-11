export const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

// unikalne ID
export const generateId = () => {
    return 'shape_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
};