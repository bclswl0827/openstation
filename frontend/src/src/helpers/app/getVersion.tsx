export const getVersion = () => {
    return process.env.REACT_APP_VERSION ?? "Custom build";
};
