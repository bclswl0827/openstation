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
  Int64: { input: number; output: number; }
};

export type Mutation = {
  __typename?: 'Mutation';
  addNewTLE: Scalars['Boolean']['output'];
  deleteTLEById: Scalars['Boolean']['output'];
  purgeForecastRecords: Scalars['Boolean']['output'];
  purgeTLERecords: Scalars['Boolean']['output'];
  purgeTaskQueue: Scalars['Boolean']['output'];
  rebootSystem: Scalars['Boolean']['output'];
  setAllTLEs: Scalars['Int']['output'];
  setPanTilt: Scalars['Boolean']['output'];
  setPanTiltOffset: Scalars['Boolean']['output'];
  setPanTiltToNorth: Scalars['Boolean']['output'];
  updateTLEById: Scalars['Boolean']['output'];
};


export type MutationAddNewTleArgs = {
  tleData: Scalars['String']['input'];
};


export type MutationDeleteTleByIdArgs = {
  id: Scalars['Int64']['input'];
};


export type MutationSetAllTlEsArgs = {
  overwrite: Scalars['Boolean']['input'];
  tleData: Scalars['String']['input'];
};


export type MutationSetPanTiltArgs = {
  newPan: Scalars['Float']['input'];
  newTilt: Scalars['Float']['input'];
};


export type MutationSetPanTiltOffsetArgs = {
  newOffset: Scalars['Float']['input'];
};


export type MutationUpdateTleByIdArgs = {
  id: Scalars['Int64']['input'];
  tleData: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  getGnss: Gnss;
  getPanTilt: PanTilt;
  getStation: Station;
  getSystem: System;
  getTLEById?: Maybe<TleData>;
  getTLEIdsByKeyword: Array<Maybe<Scalars['Int64']['output']>>;
};


export type QueryGetTleByIdArgs = {
  id: Scalars['Int64']['input'];
};


export type QueryGetTleIdsByKeywordArgs = {
  keyword: Scalars['String']['input'];
};

export type Gnss = {
  __typename?: 'gnss';
  dataQuality: Scalars['Int']['output'];
  elevation: Scalars['Float']['output'];
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  satellites: Scalars['Int']['output'];
  timestamp: Scalars['Int64']['output'];
  trueAzimuth: Scalars['Float']['output'];
};

export type PanTilt = {
  __typename?: 'panTilt';
  currentPan: Scalars['Float']['output'];
  currentTilt: Scalars['Float']['output'];
  isBusy: Scalars['Boolean']['output'];
  northOffset: Scalars['Float']['output'];
};

export type Station = {
  __typename?: 'station';
  clockOffset: Scalars['Int']['output'];
  location: Scalars['String']['output'];
  name: Scalars['String']['output'];
  pendingTasks: Scalars['Int64']['output'];
  remarks: Array<Scalars['String']['output']>;
  satellites: Scalars['Int64']['output'];
  totalForecast: Scalars['Int64']['output'];
  totalTasks: Scalars['Int64']['output'];
};

export type System = {
  __typename?: 'system';
  arch: Scalars['String']['output'];
  cpuUsage: Scalars['Float']['output'];
  diskUsage: Scalars['Float']['output'];
  hostname: Scalars['String']['output'];
  ip: Array<Scalars['String']['output']>;
  memUsage: Scalars['Float']['output'];
  release: Scalars['String']['output'];
  timestamp: Scalars['Int64']['output'];
  uptime: Scalars['Int64']['output'];
};

export type TleData = {
  __typename?: 'tleData';
  createdAt: Scalars['Int64']['output'];
  epochTime: Scalars['Int64']['output'];
  geostationary: Scalars['Boolean']['output'];
  id: Scalars['Int64']['output'];
  line_1: Scalars['String']['output'];
  line_2: Scalars['String']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['Int64']['output'];
};

export type GetControlDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetControlDataQuery = { __typename?: 'Query', getGnss: { __typename?: 'gnss', trueAzimuth: number }, getPanTilt: { __typename?: 'panTilt', currentPan: number, currentTilt: number, northOffset: number, isBusy: boolean } };

export type SetPanTiltMutationVariables = Exact<{
  newPan: Scalars['Float']['input'];
  newTilt: Scalars['Float']['input'];
  newOffset: Scalars['Float']['input'];
}>;


export type SetPanTiltMutation = { __typename?: 'Mutation', setPanTiltOffset: boolean, setPanTilt: boolean };

export type GetDebugDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDebugDataQuery = { __typename?: 'Query', getGnss: { __typename?: 'gnss', timestamp: number, latitude: number, longitude: number, elevation: number, trueAzimuth: number, dataQuality: number, satellites: number }, getPanTilt: { __typename?: 'panTilt', currentPan: number, currentTilt: number, northOffset: number, isBusy: boolean }, getSystem: { __typename?: 'system', timestamp: number, uptime: number, cpuUsage: number, memUsage: number, diskUsage: number, release: string, arch: string, hostname: string, ip: Array<string> } };

export type PurgeForecastRecordsMutationVariables = Exact<{ [key: string]: never; }>;


export type PurgeForecastRecordsMutation = { __typename?: 'Mutation', purgeForecastRecords: boolean };

export type PurgeTleRecordsMutationVariables = Exact<{ [key: string]: never; }>;


export type PurgeTleRecordsMutation = { __typename?: 'Mutation', purgeTLERecords: boolean };

export type PurgeTaskQueueMutationVariables = Exact<{ [key: string]: never; }>;


export type PurgeTaskQueueMutation = { __typename?: 'Mutation', purgeTaskQueue: boolean };

export type RebootSystemMutationVariables = Exact<{ [key: string]: never; }>;


export type RebootSystemMutation = { __typename?: 'Mutation', rebootSystem: boolean };

export type SetPanTiltToNorthMutationVariables = Exact<{ [key: string]: never; }>;


export type SetPanTiltToNorthMutation = { __typename?: 'Mutation', setPanTiltToNorth: boolean };

export type GetHomeDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetHomeDataQuery = { __typename?: 'Query', getStation: { __typename?: 'station', name: string, location: string, remarks: Array<string>, satellites: number, pendingTasks: number, totalTasks: number, totalForecast: number, clockOffset: number }, getGnss: { __typename?: 'gnss', timestamp: number, latitude: number, longitude: number, elevation: number, trueAzimuth: number, dataQuality: number, satellites: number }, getSystem: { __typename?: 'system', cpuUsage: number, memUsage: number } };


export const GetControlDataDocument = gql`
    query getControlData {
  getGnss {
    trueAzimuth
  }
  getPanTilt {
    currentPan
    currentTilt
    northOffset
    isBusy
  }
}
    `;

/**
 * __useGetControlDataQuery__
 *
 * To run a query within a React component, call `useGetControlDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetControlDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetControlDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetControlDataQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetControlDataQuery, GetControlDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetControlDataQuery, GetControlDataQueryVariables>(GetControlDataDocument, options);
      }
export function useGetControlDataLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetControlDataQuery, GetControlDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetControlDataQuery, GetControlDataQueryVariables>(GetControlDataDocument, options);
        }
export function useGetControlDataSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetControlDataQuery, GetControlDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetControlDataQuery, GetControlDataQueryVariables>(GetControlDataDocument, options);
        }
export type GetControlDataQueryHookResult = ReturnType<typeof useGetControlDataQuery>;
export type GetControlDataLazyQueryHookResult = ReturnType<typeof useGetControlDataLazyQuery>;
export type GetControlDataSuspenseQueryHookResult = ReturnType<typeof useGetControlDataSuspenseQuery>;
export type GetControlDataQueryResult = ApolloReactCommon.QueryResult<GetControlDataQuery, GetControlDataQueryVariables>;
export const SetPanTiltDocument = gql`
    mutation setPanTilt($newPan: Float!, $newTilt: Float!, $newOffset: Float!) {
  setPanTiltOffset(newOffset: $newOffset)
  setPanTilt(newPan: $newPan, newTilt: $newTilt)
}
    `;
export type SetPanTiltMutationFn = ApolloReactCommon.MutationFunction<SetPanTiltMutation, SetPanTiltMutationVariables>;

/**
 * __useSetPanTiltMutation__
 *
 * To run a mutation, you first call `useSetPanTiltMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetPanTiltMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setPanTiltMutation, { data, loading, error }] = useSetPanTiltMutation({
 *   variables: {
 *      newPan: // value for 'newPan'
 *      newTilt: // value for 'newTilt'
 *      newOffset: // value for 'newOffset'
 *   },
 * });
 */
export function useSetPanTiltMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SetPanTiltMutation, SetPanTiltMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SetPanTiltMutation, SetPanTiltMutationVariables>(SetPanTiltDocument, options);
      }
export type SetPanTiltMutationHookResult = ReturnType<typeof useSetPanTiltMutation>;
export type SetPanTiltMutationResult = ApolloReactCommon.MutationResult<SetPanTiltMutation>;
export type SetPanTiltMutationOptions = ApolloReactCommon.BaseMutationOptions<SetPanTiltMutation, SetPanTiltMutationVariables>;
export const GetDebugDataDocument = gql`
    query getDebugData {
  getGnss {
    timestamp
    latitude
    longitude
    elevation
    trueAzimuth
    dataQuality
    satellites
  }
  getPanTilt {
    currentPan
    currentTilt
    northOffset
    isBusy
  }
  getSystem {
    timestamp
    uptime
    cpuUsage
    memUsage
    diskUsage
    release
    arch
    hostname
    ip
  }
}
    `;

/**
 * __useGetDebugDataQuery__
 *
 * To run a query within a React component, call `useGetDebugDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDebugDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDebugDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetDebugDataQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetDebugDataQuery, GetDebugDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetDebugDataQuery, GetDebugDataQueryVariables>(GetDebugDataDocument, options);
      }
export function useGetDebugDataLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetDebugDataQuery, GetDebugDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetDebugDataQuery, GetDebugDataQueryVariables>(GetDebugDataDocument, options);
        }
export function useGetDebugDataSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetDebugDataQuery, GetDebugDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetDebugDataQuery, GetDebugDataQueryVariables>(GetDebugDataDocument, options);
        }
export type GetDebugDataQueryHookResult = ReturnType<typeof useGetDebugDataQuery>;
export type GetDebugDataLazyQueryHookResult = ReturnType<typeof useGetDebugDataLazyQuery>;
export type GetDebugDataSuspenseQueryHookResult = ReturnType<typeof useGetDebugDataSuspenseQuery>;
export type GetDebugDataQueryResult = ApolloReactCommon.QueryResult<GetDebugDataQuery, GetDebugDataQueryVariables>;
export const PurgeForecastRecordsDocument = gql`
    mutation purgeForecastRecords {
  purgeForecastRecords
}
    `;
export type PurgeForecastRecordsMutationFn = ApolloReactCommon.MutationFunction<PurgeForecastRecordsMutation, PurgeForecastRecordsMutationVariables>;

/**
 * __usePurgeForecastRecordsMutation__
 *
 * To run a mutation, you first call `usePurgeForecastRecordsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePurgeForecastRecordsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [purgeForecastRecordsMutation, { data, loading, error }] = usePurgeForecastRecordsMutation({
 *   variables: {
 *   },
 * });
 */
export function usePurgeForecastRecordsMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<PurgeForecastRecordsMutation, PurgeForecastRecordsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<PurgeForecastRecordsMutation, PurgeForecastRecordsMutationVariables>(PurgeForecastRecordsDocument, options);
      }
export type PurgeForecastRecordsMutationHookResult = ReturnType<typeof usePurgeForecastRecordsMutation>;
export type PurgeForecastRecordsMutationResult = ApolloReactCommon.MutationResult<PurgeForecastRecordsMutation>;
export type PurgeForecastRecordsMutationOptions = ApolloReactCommon.BaseMutationOptions<PurgeForecastRecordsMutation, PurgeForecastRecordsMutationVariables>;
export const PurgeTleRecordsDocument = gql`
    mutation purgeTLERecords {
  purgeTLERecords
}
    `;
export type PurgeTleRecordsMutationFn = ApolloReactCommon.MutationFunction<PurgeTleRecordsMutation, PurgeTleRecordsMutationVariables>;

/**
 * __usePurgeTleRecordsMutation__
 *
 * To run a mutation, you first call `usePurgeTleRecordsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePurgeTleRecordsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [purgeTleRecordsMutation, { data, loading, error }] = usePurgeTleRecordsMutation({
 *   variables: {
 *   },
 * });
 */
export function usePurgeTleRecordsMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<PurgeTleRecordsMutation, PurgeTleRecordsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<PurgeTleRecordsMutation, PurgeTleRecordsMutationVariables>(PurgeTleRecordsDocument, options);
      }
export type PurgeTleRecordsMutationHookResult = ReturnType<typeof usePurgeTleRecordsMutation>;
export type PurgeTleRecordsMutationResult = ApolloReactCommon.MutationResult<PurgeTleRecordsMutation>;
export type PurgeTleRecordsMutationOptions = ApolloReactCommon.BaseMutationOptions<PurgeTleRecordsMutation, PurgeTleRecordsMutationVariables>;
export const PurgeTaskQueueDocument = gql`
    mutation purgeTaskQueue {
  purgeTaskQueue
}
    `;
export type PurgeTaskQueueMutationFn = ApolloReactCommon.MutationFunction<PurgeTaskQueueMutation, PurgeTaskQueueMutationVariables>;

/**
 * __usePurgeTaskQueueMutation__
 *
 * To run a mutation, you first call `usePurgeTaskQueueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePurgeTaskQueueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [purgeTaskQueueMutation, { data, loading, error }] = usePurgeTaskQueueMutation({
 *   variables: {
 *   },
 * });
 */
export function usePurgeTaskQueueMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<PurgeTaskQueueMutation, PurgeTaskQueueMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<PurgeTaskQueueMutation, PurgeTaskQueueMutationVariables>(PurgeTaskQueueDocument, options);
      }
export type PurgeTaskQueueMutationHookResult = ReturnType<typeof usePurgeTaskQueueMutation>;
export type PurgeTaskQueueMutationResult = ApolloReactCommon.MutationResult<PurgeTaskQueueMutation>;
export type PurgeTaskQueueMutationOptions = ApolloReactCommon.BaseMutationOptions<PurgeTaskQueueMutation, PurgeTaskQueueMutationVariables>;
export const RebootSystemDocument = gql`
    mutation rebootSystem {
  rebootSystem
}
    `;
export type RebootSystemMutationFn = ApolloReactCommon.MutationFunction<RebootSystemMutation, RebootSystemMutationVariables>;

/**
 * __useRebootSystemMutation__
 *
 * To run a mutation, you first call `useRebootSystemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRebootSystemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [rebootSystemMutation, { data, loading, error }] = useRebootSystemMutation({
 *   variables: {
 *   },
 * });
 */
export function useRebootSystemMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RebootSystemMutation, RebootSystemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RebootSystemMutation, RebootSystemMutationVariables>(RebootSystemDocument, options);
      }
export type RebootSystemMutationHookResult = ReturnType<typeof useRebootSystemMutation>;
export type RebootSystemMutationResult = ApolloReactCommon.MutationResult<RebootSystemMutation>;
export type RebootSystemMutationOptions = ApolloReactCommon.BaseMutationOptions<RebootSystemMutation, RebootSystemMutationVariables>;
export const SetPanTiltToNorthDocument = gql`
    mutation setPanTiltToNorth {
  setPanTiltToNorth
}
    `;
export type SetPanTiltToNorthMutationFn = ApolloReactCommon.MutationFunction<SetPanTiltToNorthMutation, SetPanTiltToNorthMutationVariables>;

/**
 * __useSetPanTiltToNorthMutation__
 *
 * To run a mutation, you first call `useSetPanTiltToNorthMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetPanTiltToNorthMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setPanTiltToNorthMutation, { data, loading, error }] = useSetPanTiltToNorthMutation({
 *   variables: {
 *   },
 * });
 */
export function useSetPanTiltToNorthMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SetPanTiltToNorthMutation, SetPanTiltToNorthMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SetPanTiltToNorthMutation, SetPanTiltToNorthMutationVariables>(SetPanTiltToNorthDocument, options);
      }
export type SetPanTiltToNorthMutationHookResult = ReturnType<typeof useSetPanTiltToNorthMutation>;
export type SetPanTiltToNorthMutationResult = ApolloReactCommon.MutationResult<SetPanTiltToNorthMutation>;
export type SetPanTiltToNorthMutationOptions = ApolloReactCommon.BaseMutationOptions<SetPanTiltToNorthMutation, SetPanTiltToNorthMutationVariables>;
export const GetHomeDataDocument = gql`
    query getHomeData {
  getStation {
    name
    location
    remarks
    satellites
    pendingTasks
    totalTasks
    totalForecast
    clockOffset
  }
  getGnss {
    timestamp
    latitude
    longitude
    elevation
    trueAzimuth
    dataQuality
    satellites
  }
  getSystem {
    cpuUsage
    memUsage
  }
}
    `;

/**
 * __useGetHomeDataQuery__
 *
 * To run a query within a React component, call `useGetHomeDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHomeDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHomeDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetHomeDataQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetHomeDataQuery, GetHomeDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetHomeDataQuery, GetHomeDataQueryVariables>(GetHomeDataDocument, options);
      }
export function useGetHomeDataLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetHomeDataQuery, GetHomeDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetHomeDataQuery, GetHomeDataQueryVariables>(GetHomeDataDocument, options);
        }
export function useGetHomeDataSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetHomeDataQuery, GetHomeDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetHomeDataQuery, GetHomeDataQueryVariables>(GetHomeDataDocument, options);
        }
export type GetHomeDataQueryHookResult = ReturnType<typeof useGetHomeDataQuery>;
export type GetHomeDataLazyQueryHookResult = ReturnType<typeof useGetHomeDataLazyQuery>;
export type GetHomeDataSuspenseQueryHookResult = ReturnType<typeof useGetHomeDataSuspenseQuery>;
export type GetHomeDataQueryResult = ApolloReactCommon.QueryResult<GetHomeDataQuery, GetHomeDataQueryVariables>;