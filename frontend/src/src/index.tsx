import "./index.css";

import {
    ApolloClient,
    ApolloProvider,
    HttpLink,
    InMemoryCache,
} from "@apollo/client";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";

import App from "./App";
import { RouterWrapper } from "./components/RouterWrapper";
import { routerConfig } from "./config/router";

const root = ReactDOM.createRoot(document.getElementById("root")!);
const apolloClient = new ApolloClient({
    defaultOptions: {
        query: { errorPolicy: "all", fetchPolicy: "network-only" },
        watchQuery: { errorPolicy: "all", fetchPolicy: "network-only" },
    },
    link: new HttpLink({ uri: "http://127.0.0.1:8080/api" }),
    cache: new InMemoryCache(),
});

root.render(
	<ErrorBoundary fallback={<div>Something went wrong</div>}>
		<ApolloProvider client={apolloClient}>
			<RouterWrapper mode={routerConfig.mode} basename={routerConfig.basename}>
				<App />
			</RouterWrapper>
		</ApolloProvider>
	</ErrorBoundary>
);
