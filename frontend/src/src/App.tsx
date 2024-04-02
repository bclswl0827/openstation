import { useEffect } from "react";

const App = () => {
    useEffect(() => {
        document.querySelector(".public-loading")?.remove();
    }, []);

    return <div className="text-indigo-500">OpenStation</div>;
};

export default App;
