function normalize(text) {
    if (text && text.length >= 0)
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    else return text;
}

export default normalize;