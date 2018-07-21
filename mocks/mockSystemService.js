const factory = () => {

    const fn = jest.fn();

    return {
        systemExit: fn,
    }
}

export default factory;