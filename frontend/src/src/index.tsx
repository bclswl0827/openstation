import "./index.css";

import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from "@apollo/client";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";

import App from "./App";
import { Error } from "./components/Error";
import { RouterWrapper } from "./components/RouterWrapper";
import { routerConfig } from "./config/router";

const root = ReactDOM.createRoot(document.getElementById("root")!);
const apolloClient = new ApolloClient({
	defaultOptions: {
		query: { errorPolicy: "all", fetchPolicy: "network-only" },
		watchQuery: { errorPolicy: "all", fetchPolicy: "network-only" }
	},
	link: new HttpLink({
		uri:
			process.env.NODE_ENV === "production"
				? process.env.REACT_APP_GRAPHQL_PROD_URL
				: process.env.REACT_APP_GRAPHQL_DEVL_URL
	}),
	cache: new InMemoryCache()
});

root.render(
	<ErrorBoundary fallback={<Error />}>
		<ApolloProvider client={apolloClient}>
			<RouterWrapper mode={routerConfig.mode} basename={routerConfig.basename}>
				<App />
			</RouterWrapper>
		</ApolloProvider>
	</ErrorBoundary>
);
