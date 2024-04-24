import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Mutation = {
  __typename?: 'Mutation';
  createUser: User;
};


export type MutationCreateUserArgs = {
  name: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  user?: Maybe<User>;
  version: Scalars['String']['output'];
};


export type QueryUserArgs = {
  id: Scalars['Int']['input'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type GoodsQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GoodsQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: number, name: string } | null };

export type VersionQueryVariables = Exact<{ [key: string]: never; }>;


export type VersionQuery = { __typename?: 'Query', version: string };


export const GoodsDocument = gql`
    query Goods($id: Int!) {
  user(id: $id) {
    id
    name
  }
}
    `;

/**
 * __useGoodsQuery__
 *
 * To run a query within a React component, call `useGoodsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGoodsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGoodsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGoodsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GoodsQuery, GoodsQueryVariables> & ({ variables: GoodsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GoodsQuery, GoodsQueryVariables>(GoodsDocument, options);
      }
export function useGoodsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GoodsQuery, GoodsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GoodsQuery, GoodsQueryVariables>(GoodsDocument, options);
        }
export function useGoodsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GoodsQuery, GoodsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GoodsQuery, GoodsQueryVariables>(GoodsDocument, options);
        }
export type GoodsQueryHookResult = ReturnType<typeof useGoodsQuery>;
export type GoodsLazyQueryHookResult = ReturnType<typeof useGoodsLazyQuery>;
export type GoodsSuspenseQueryHookResult = ReturnType<typeof useGoodsSuspenseQuery>;
export type GoodsQueryResult = ApolloReactCommon.QueryResult<GoodsQuery, GoodsQueryVariables>;
export const VersionDocument = gql`
    query Version {
  version
}
    `;

/**
 * __useVersionQuery__
 *
 * To run a query within a React component, call `useVersionQuery` and pass it any options that fit your needs.
 * When your component renders, `useVersionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVersionQuery({
 *   variables: {
 *   },
 * });
 */
export function useVersionQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<VersionQuery, VersionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<VersionQuery, VersionQueryVariables>(VersionDocument, options);
      }
export function useVersionLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<VersionQuery, VersionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<VersionQuery, VersionQueryVariables>(VersionDocument, options);
        }
export function useVersionSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<VersionQuery, VersionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<VersionQuery, VersionQueryVariables>(VersionDocument, options);
        }
export type VersionQueryHookResult = ReturnType<typeof useVersionQuery>;
export type VersionLazyQueryHookResult = ReturnType<typeof useVersionLazyQuery>;
export type VersionSuspenseQueryHookResult = ReturnType<typeof useVersionSuspenseQuery>;
export type VersionQueryResult = ApolloReactCommon.QueryResult<VersionQuery, VersionQueryVariables>;