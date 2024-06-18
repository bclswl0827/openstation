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
  addNewTask: Scalars['Boolean']['output'];
  deleteTLEById: Scalars['Boolean']['output'];
  deleteTaskById: Scalars['Boolean']['output'];
  importTLEs: Scalars['Int']['output'];
  purgeTLERecords: Scalars['Boolean']['output'];
  purgeTaskQueue: Scalars['Boolean']['output'];
  rebootSystem: Scalars['Boolean']['output'];
  setPanTilt: Scalars['Boolean']['output'];
  setPanTiltOffset: Scalars['Boolean']['output'];
  setPanTiltToNorth: Scalars['Boolean']['output'];
  updateTLEById: Scalars['Boolean']['output'];
};


export type MutationAddNewTleArgs = {
  tleData: Scalars['String']['input'];
};


export type MutationAddNewTaskArgs = {
  elevationThreshold: Scalars['Float']['input'];
  endTime: Scalars['Int64']['input'];
  gnssElevation: Scalars['Float']['input'];
  gnssLatitude: Scalars['Float']['input'];
  gnssLongitude: Scalars['Float']['input'];
  startTime: Scalars['Int64']['input'];
  tleId: Scalars['Int64']['input'];
};


export type MutationDeleteTleByIdArgs = {
  tleId: Scalars['Int64']['input'];
};


export type MutationDeleteTaskByIdArgs = {
  taskId: Scalars['Int64']['input'];
};


export type MutationImportTlEsArgs = {
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
  tleData: Scalars['String']['input'];
  tleId: Scalars['Int64']['input'];
};

export type Query = {
  __typename?: 'Query';
  getForecastById: Array<Maybe<Forecast>>;
  getGnss: Gnss;
  getObservationById: Observation;
  getPanTilt: PanTilt;
  getPendingTasks: Array<Maybe<Task>>;
  getStation: Station;
  getSystem: System;
  getTLEById?: Maybe<TleData>;
  getTLEsByKeyword: Array<Maybe<TleData>>;
  getTotalTasks: Array<Maybe<Task>>;
};


export type QueryGetForecastByIdArgs = {
  elevationThreshold: Scalars['Float']['input'];
  gnssElevation: Scalars['Float']['input'];
  gnssLatitude: Scalars['Float']['input'];
  gnssLongitude: Scalars['Float']['input'];
  tleId: Scalars['Int64']['input'];
};


export type QueryGetObservationByIdArgs = {
  elevationThreshold: Scalars['Float']['input'];
  gnssElevation: Scalars['Float']['input'];
  gnssLatitude: Scalars['Float']['input'];
  gnssLongitude: Scalars['Float']['input'];
  tleId: Scalars['Int64']['input'];
};


export type QueryGetTleByIdArgs = {
  tleId: Scalars['Int64']['input'];
};


export type QueryGetTlEsByKeywordArgs = {
  keyword: Scalars['String']['input'];
};

export type Forecast = {
  __typename?: 'forecast';
  duration: Scalars['Float']['output'];
  endTime: Scalars['Int64']['output'];
  entryAzimuth: Scalars['Float']['output'];
  exitAzimuth: Scalars['Float']['output'];
  gnssElevation: Scalars['Float']['output'];
  gnssLatitude: Scalars['Float']['output'];
  gnssLongitude: Scalars['Float']['output'];
  maxElevation: Scalars['Float']['output'];
  startTime: Scalars['Int64']['output'];
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

export type Observation = {
  __typename?: 'observation';
  azimuth: Scalars['Float']['output'];
  elevation: Scalars['Float']['output'];
  observable: Scalars['Boolean']['output'];
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

export type Task = {
  __typename?: 'task';
  createdAt: Scalars['Int64']['output'];
  endTime: Scalars['Int64']['output'];
  hasDone: Scalars['Boolean']['output'];
  id: Scalars['Int64']['output'];
  name: Scalars['String']['output'];
  startTime: Scalars['Int64']['output'];
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

export type GetData4ControlQueryVariables = Exact<{ [key: string]: never; }>;


export type GetData4ControlQuery = { __typename?: 'Query', getGnss: { __typename?: 'gnss', trueAzimuth: number }, getPanTilt: { __typename?: 'panTilt', currentPan: number, currentTilt: number, northOffset: number, isBusy: boolean } };

export type SetPanTiltMutationVariables = Exact<{
  newPan: Scalars['Float']['input'];
  newTilt: Scalars['Float']['input'];
}>;


export type SetPanTiltMutation = { __typename?: 'Mutation', setPanTilt: boolean };

export type SetPanTiltOffsetMutationVariables = Exact<{
  newOffset: Scalars['Float']['input'];
}>;


export type SetPanTiltOffsetMutation = { __typename?: 'Mutation', setPanTiltOffset: boolean };

export type GetData4DebugQueryVariables = Exact<{ [key: string]: never; }>;


export type GetData4DebugQuery = { __typename?: 'Query', getGnss: { __typename?: 'gnss', timestamp: number, latitude: number, longitude: number, elevation: number, trueAzimuth: number, dataQuality: number, satellites: number }, getPanTilt: { __typename?: 'panTilt', currentPan: number, currentTilt: number, northOffset: number, isBusy: boolean }, getSystem: { __typename?: 'system', timestamp: number, uptime: number, cpuUsage: number, memUsage: number, diskUsage: number, release: string, arch: string, hostname: string, ip: Array<string> } };

export type PurgeTleRecordsMutationVariables = Exact<{ [key: string]: never; }>;


export type PurgeTleRecordsMutation = { __typename?: 'Mutation', purgeTLERecords: boolean };

export type PurgeTaskQueueMutationVariables = Exact<{ [key: string]: never; }>;


export type PurgeTaskQueueMutation = { __typename?: 'Mutation', purgeTaskQueue: boolean };

export type RebootSystemMutationVariables = Exact<{ [key: string]: never; }>;


export type RebootSystemMutation = { __typename?: 'Mutation', rebootSystem: boolean };

export type SetPanTiltToNorthMutationVariables = Exact<{ [key: string]: never; }>;


export type SetPanTiltToNorthMutation = { __typename?: 'Mutation', setPanTiltToNorth: boolean };

export type GetData4HomeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetData4HomeQuery = { __typename?: 'Query', getStation: { __typename?: 'station', name: string, location: string, remarks: Array<string>, satellites: number, pendingTasks: number, totalTasks: number, clockOffset: number }, getGnss: { __typename?: 'gnss', timestamp: number, latitude: number, longitude: number, elevation: number, trueAzimuth: number, satellites: number }, getSystem: { __typename?: 'system', cpuUsage: number, memUsage: number } };

export type AddNewTleMutationVariables = Exact<{
  tleData: Scalars['String']['input'];
}>;


export type AddNewTleMutation = { __typename?: 'Mutation', addNewTLE: boolean };

export type AddNewTaskMutationVariables = Exact<{
  tleId: Scalars['Int64']['input'];
  elevationThreshold: Scalars['Float']['input'];
  gnssLatitude: Scalars['Float']['input'];
  gnssLongitude: Scalars['Float']['input'];
  gnssElevation: Scalars['Float']['input'];
  startTime: Scalars['Int64']['input'];
  endTime: Scalars['Int64']['input'];
}>;


export type AddNewTaskMutation = { __typename?: 'Mutation', addNewTask: boolean };

export type DeleteTleByIdMutationVariables = Exact<{
  tleId: Scalars['Int64']['input'];
}>;


export type DeleteTleByIdMutation = { __typename?: 'Mutation', deleteTLEById: boolean };

export type GetData4SatellitesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetData4SatellitesQuery = { __typename?: 'Query', getGnss: { __typename?: 'gnss', timestamp: number, latitude: number, longitude: number, elevation: number } };

export type GetForecastByIdQueryVariables = Exact<{
  tleId: Scalars['Int64']['input'];
  elevationThreshold: Scalars['Float']['input'];
  gnssLatitude: Scalars['Float']['input'];
  gnssLongitude: Scalars['Float']['input'];
  gnssElevation: Scalars['Float']['input'];
}>;


export type GetForecastByIdQuery = { __typename?: 'Query', getForecastById: Array<{ __typename?: 'forecast', duration: number, startTime: number, endTime: number, entryAzimuth: number, exitAzimuth: number, maxElevation: number, gnssLatitude: number, gnssLongitude: number, gnssElevation: number } | null> };

export type GetObservationByIdQueryVariables = Exact<{
  tleId: Scalars['Int64']['input'];
  elevationThreshold: Scalars['Float']['input'];
  gnssLatitude: Scalars['Float']['input'];
  gnssLongitude: Scalars['Float']['input'];
  gnssElevation: Scalars['Float']['input'];
}>;


export type GetObservationByIdQuery = { __typename?: 'Query', getObservationById: { __typename?: 'observation', elevation: number, azimuth: number, observable: boolean } };

export type GetTlEsByKeywordQueryVariables = Exact<{
  keyword: Scalars['String']['input'];
}>;


export type GetTlEsByKeywordQuery = { __typename?: 'Query', getTLEsByKeyword: Array<{ __typename?: 'tleData', id: number, name: string, line_1: string, line_2: string, epochTime: number, createdAt: number, updatedAt: number, geostationary: boolean } | null> };

export type ImportTlEsMutationVariables = Exact<{
  tleData: Scalars['String']['input'];
}>;


export type ImportTlEsMutation = { __typename?: 'Mutation', importTLEs: number };

export type UpdateTleByIdMutationVariables = Exact<{
  tleId: Scalars['Int64']['input'];
  tleData: Scalars['String']['input'];
}>;


export type UpdateTleByIdMutation = { __typename?: 'Mutation', updateTLEById: boolean };

export type DeleteTaskByIdMutationVariables = Exact<{
  taskId: Scalars['Int64']['input'];
}>;


export type DeleteTaskByIdMutation = { __typename?: 'Mutation', deleteTaskById: boolean };

export type GetData4TasksQueryVariables = Exact<{ [key: string]: never; }>;


export type GetData4TasksQuery = { __typename?: 'Query', getTotalTasks: Array<{ __typename?: 'task', id: number, name: string, startTime: number, endTime: number, hasDone: boolean, createdAt: number } | null>, getPendingTasks: Array<{ __typename?: 'task', id: number, name: string, startTime: number, endTime: number, hasDone: boolean, createdAt: number } | null>, getGnss: { __typename?: 'gnss', timestamp: number } };


export const GetData4ControlDocument = gql`
    query getData4Control {
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
 * __useGetData4ControlQuery__
 *
 * To run a query within a React component, call `useGetData4ControlQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetData4ControlQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetData4ControlQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetData4ControlQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetData4ControlQuery, GetData4ControlQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetData4ControlQuery, GetData4ControlQueryVariables>(GetData4ControlDocument, options);
      }
export function useGetData4ControlLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetData4ControlQuery, GetData4ControlQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetData4ControlQuery, GetData4ControlQueryVariables>(GetData4ControlDocument, options);
        }
export function useGetData4ControlSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetData4ControlQuery, GetData4ControlQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetData4ControlQuery, GetData4ControlQueryVariables>(GetData4ControlDocument, options);
        }
export type GetData4ControlQueryHookResult = ReturnType<typeof useGetData4ControlQuery>;
export type GetData4ControlLazyQueryHookResult = ReturnType<typeof useGetData4ControlLazyQuery>;
export type GetData4ControlSuspenseQueryHookResult = ReturnType<typeof useGetData4ControlSuspenseQuery>;
export type GetData4ControlQueryResult = ApolloReactCommon.QueryResult<GetData4ControlQuery, GetData4ControlQueryVariables>;
export const SetPanTiltDocument = gql`
    mutation setPanTilt($newPan: Float!, $newTilt: Float!) {
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
export const SetPanTiltOffsetDocument = gql`
    mutation setPanTiltOffset($newOffset: Float!) {
  setPanTiltOffset(newOffset: $newOffset)
}
    `;
export type SetPanTiltOffsetMutationFn = ApolloReactCommon.MutationFunction<SetPanTiltOffsetMutation, SetPanTiltOffsetMutationVariables>;

/**
 * __useSetPanTiltOffsetMutation__
 *
 * To run a mutation, you first call `useSetPanTiltOffsetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetPanTiltOffsetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setPanTiltOffsetMutation, { data, loading, error }] = useSetPanTiltOffsetMutation({
 *   variables: {
 *      newOffset: // value for 'newOffset'
 *   },
 * });
 */
export function useSetPanTiltOffsetMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SetPanTiltOffsetMutation, SetPanTiltOffsetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SetPanTiltOffsetMutation, SetPanTiltOffsetMutationVariables>(SetPanTiltOffsetDocument, options);
      }
export type SetPanTiltOffsetMutationHookResult = ReturnType<typeof useSetPanTiltOffsetMutation>;
export type SetPanTiltOffsetMutationResult = ApolloReactCommon.MutationResult<SetPanTiltOffsetMutation>;
export type SetPanTiltOffsetMutationOptions = ApolloReactCommon.BaseMutationOptions<SetPanTiltOffsetMutation, SetPanTiltOffsetMutationVariables>;
export const GetData4DebugDocument = gql`
    query getData4Debug {
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
 * __useGetData4DebugQuery__
 *
 * To run a query within a React component, call `useGetData4DebugQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetData4DebugQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetData4DebugQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetData4DebugQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetData4DebugQuery, GetData4DebugQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetData4DebugQuery, GetData4DebugQueryVariables>(GetData4DebugDocument, options);
      }
export function useGetData4DebugLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetData4DebugQuery, GetData4DebugQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetData4DebugQuery, GetData4DebugQueryVariables>(GetData4DebugDocument, options);
        }
export function useGetData4DebugSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetData4DebugQuery, GetData4DebugQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetData4DebugQuery, GetData4DebugQueryVariables>(GetData4DebugDocument, options);
        }
export type GetData4DebugQueryHookResult = ReturnType<typeof useGetData4DebugQuery>;
export type GetData4DebugLazyQueryHookResult = ReturnType<typeof useGetData4DebugLazyQuery>;
export type GetData4DebugSuspenseQueryHookResult = ReturnType<typeof useGetData4DebugSuspenseQuery>;
export type GetData4DebugQueryResult = ApolloReactCommon.QueryResult<GetData4DebugQuery, GetData4DebugQueryVariables>;
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
export const GetData4HomeDocument = gql`
    query getData4Home {
  getStation {
    name
    location
    remarks
    satellites
    pendingTasks
    totalTasks
    clockOffset
  }
  getGnss {
    timestamp
    latitude
    longitude
    elevation
    trueAzimuth
    satellites
  }
  getSystem {
    cpuUsage
    memUsage
  }
}
    `;

/**
 * __useGetData4HomeQuery__
 *
 * To run a query within a React component, call `useGetData4HomeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetData4HomeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetData4HomeQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetData4HomeQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetData4HomeQuery, GetData4HomeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetData4HomeQuery, GetData4HomeQueryVariables>(GetData4HomeDocument, options);
      }
export function useGetData4HomeLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetData4HomeQuery, GetData4HomeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetData4HomeQuery, GetData4HomeQueryVariables>(GetData4HomeDocument, options);
        }
export function useGetData4HomeSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetData4HomeQuery, GetData4HomeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetData4HomeQuery, GetData4HomeQueryVariables>(GetData4HomeDocument, options);
        }
export type GetData4HomeQueryHookResult = ReturnType<typeof useGetData4HomeQuery>;
export type GetData4HomeLazyQueryHookResult = ReturnType<typeof useGetData4HomeLazyQuery>;
export type GetData4HomeSuspenseQueryHookResult = ReturnType<typeof useGetData4HomeSuspenseQuery>;
export type GetData4HomeQueryResult = ApolloReactCommon.QueryResult<GetData4HomeQuery, GetData4HomeQueryVariables>;
export const AddNewTleDocument = gql`
    mutation addNewTLE($tleData: String!) {
  addNewTLE(tleData: $tleData)
}
    `;
export type AddNewTleMutationFn = ApolloReactCommon.MutationFunction<AddNewTleMutation, AddNewTleMutationVariables>;

/**
 * __useAddNewTleMutation__
 *
 * To run a mutation, you first call `useAddNewTleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddNewTleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addNewTleMutation, { data, loading, error }] = useAddNewTleMutation({
 *   variables: {
 *      tleData: // value for 'tleData'
 *   },
 * });
 */
export function useAddNewTleMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<AddNewTleMutation, AddNewTleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<AddNewTleMutation, AddNewTleMutationVariables>(AddNewTleDocument, options);
      }
export type AddNewTleMutationHookResult = ReturnType<typeof useAddNewTleMutation>;
export type AddNewTleMutationResult = ApolloReactCommon.MutationResult<AddNewTleMutation>;
export type AddNewTleMutationOptions = ApolloReactCommon.BaseMutationOptions<AddNewTleMutation, AddNewTleMutationVariables>;
export const AddNewTaskDocument = gql`
    mutation addNewTask($tleId: Int64!, $elevationThreshold: Float!, $gnssLatitude: Float!, $gnssLongitude: Float!, $gnssElevation: Float!, $startTime: Int64!, $endTime: Int64!) {
  addNewTask(
    tleId: $tleId
    elevationThreshold: $elevationThreshold
    gnssLatitude: $gnssLatitude
    gnssLongitude: $gnssLongitude
    gnssElevation: $gnssElevation
    startTime: $startTime
    endTime: $endTime
  )
}
    `;
export type AddNewTaskMutationFn = ApolloReactCommon.MutationFunction<AddNewTaskMutation, AddNewTaskMutationVariables>;

/**
 * __useAddNewTaskMutation__
 *
 * To run a mutation, you first call `useAddNewTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddNewTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addNewTaskMutation, { data, loading, error }] = useAddNewTaskMutation({
 *   variables: {
 *      tleId: // value for 'tleId'
 *      elevationThreshold: // value for 'elevationThreshold'
 *      gnssLatitude: // value for 'gnssLatitude'
 *      gnssLongitude: // value for 'gnssLongitude'
 *      gnssElevation: // value for 'gnssElevation'
 *      startTime: // value for 'startTime'
 *      endTime: // value for 'endTime'
 *   },
 * });
 */
export function useAddNewTaskMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<AddNewTaskMutation, AddNewTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<AddNewTaskMutation, AddNewTaskMutationVariables>(AddNewTaskDocument, options);
      }
export type AddNewTaskMutationHookResult = ReturnType<typeof useAddNewTaskMutation>;
export type AddNewTaskMutationResult = ApolloReactCommon.MutationResult<AddNewTaskMutation>;
export type AddNewTaskMutationOptions = ApolloReactCommon.BaseMutationOptions<AddNewTaskMutation, AddNewTaskMutationVariables>;
export const DeleteTleByIdDocument = gql`
    mutation deleteTLEById($tleId: Int64!) {
  deleteTLEById(tleId: $tleId)
}
    `;
export type DeleteTleByIdMutationFn = ApolloReactCommon.MutationFunction<DeleteTleByIdMutation, DeleteTleByIdMutationVariables>;

/**
 * __useDeleteTleByIdMutation__
 *
 * To run a mutation, you first call `useDeleteTleByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTleByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTleByIdMutation, { data, loading, error }] = useDeleteTleByIdMutation({
 *   variables: {
 *      tleId: // value for 'tleId'
 *   },
 * });
 */
export function useDeleteTleByIdMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteTleByIdMutation, DeleteTleByIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteTleByIdMutation, DeleteTleByIdMutationVariables>(DeleteTleByIdDocument, options);
      }
export type DeleteTleByIdMutationHookResult = ReturnType<typeof useDeleteTleByIdMutation>;
export type DeleteTleByIdMutationResult = ApolloReactCommon.MutationResult<DeleteTleByIdMutation>;
export type DeleteTleByIdMutationOptions = ApolloReactCommon.BaseMutationOptions<DeleteTleByIdMutation, DeleteTleByIdMutationVariables>;
export const GetData4SatellitesDocument = gql`
    query getData4Satellites {
  getGnss {
    timestamp
    latitude
    longitude
    elevation
  }
}
    `;

/**
 * __useGetData4SatellitesQuery__
 *
 * To run a query within a React component, call `useGetData4SatellitesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetData4SatellitesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetData4SatellitesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetData4SatellitesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetData4SatellitesQuery, GetData4SatellitesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetData4SatellitesQuery, GetData4SatellitesQueryVariables>(GetData4SatellitesDocument, options);
      }
export function useGetData4SatellitesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetData4SatellitesQuery, GetData4SatellitesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetData4SatellitesQuery, GetData4SatellitesQueryVariables>(GetData4SatellitesDocument, options);
        }
export function useGetData4SatellitesSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetData4SatellitesQuery, GetData4SatellitesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetData4SatellitesQuery, GetData4SatellitesQueryVariables>(GetData4SatellitesDocument, options);
        }
export type GetData4SatellitesQueryHookResult = ReturnType<typeof useGetData4SatellitesQuery>;
export type GetData4SatellitesLazyQueryHookResult = ReturnType<typeof useGetData4SatellitesLazyQuery>;
export type GetData4SatellitesSuspenseQueryHookResult = ReturnType<typeof useGetData4SatellitesSuspenseQuery>;
export type GetData4SatellitesQueryResult = ApolloReactCommon.QueryResult<GetData4SatellitesQuery, GetData4SatellitesQueryVariables>;
export const GetForecastByIdDocument = gql`
    query getForecastById($tleId: Int64!, $elevationThreshold: Float!, $gnssLatitude: Float!, $gnssLongitude: Float!, $gnssElevation: Float!) {
  getForecastById(
    tleId: $tleId
    elevationThreshold: $elevationThreshold
    gnssLatitude: $gnssLatitude
    gnssLongitude: $gnssLongitude
    gnssElevation: $gnssElevation
  ) {
    duration
    startTime
    endTime
    entryAzimuth
    exitAzimuth
    maxElevation
    gnssLatitude
    gnssLongitude
    gnssElevation
  }
}
    `;

/**
 * __useGetForecastByIdQuery__
 *
 * To run a query within a React component, call `useGetForecastByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetForecastByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetForecastByIdQuery({
 *   variables: {
 *      tleId: // value for 'tleId'
 *      elevationThreshold: // value for 'elevationThreshold'
 *      gnssLatitude: // value for 'gnssLatitude'
 *      gnssLongitude: // value for 'gnssLongitude'
 *      gnssElevation: // value for 'gnssElevation'
 *   },
 * });
 */
export function useGetForecastByIdQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetForecastByIdQuery, GetForecastByIdQueryVariables> & ({ variables: GetForecastByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetForecastByIdQuery, GetForecastByIdQueryVariables>(GetForecastByIdDocument, options);
      }
export function useGetForecastByIdLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetForecastByIdQuery, GetForecastByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetForecastByIdQuery, GetForecastByIdQueryVariables>(GetForecastByIdDocument, options);
        }
export function useGetForecastByIdSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetForecastByIdQuery, GetForecastByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetForecastByIdQuery, GetForecastByIdQueryVariables>(GetForecastByIdDocument, options);
        }
export type GetForecastByIdQueryHookResult = ReturnType<typeof useGetForecastByIdQuery>;
export type GetForecastByIdLazyQueryHookResult = ReturnType<typeof useGetForecastByIdLazyQuery>;
export type GetForecastByIdSuspenseQueryHookResult = ReturnType<typeof useGetForecastByIdSuspenseQuery>;
export type GetForecastByIdQueryResult = ApolloReactCommon.QueryResult<GetForecastByIdQuery, GetForecastByIdQueryVariables>;
export const GetObservationByIdDocument = gql`
    query getObservationById($tleId: Int64!, $elevationThreshold: Float!, $gnssLatitude: Float!, $gnssLongitude: Float!, $gnssElevation: Float!) {
  getObservationById(
    tleId: $tleId
    elevationThreshold: $elevationThreshold
    gnssLatitude: $gnssLatitude
    gnssLongitude: $gnssLongitude
    gnssElevation: $gnssElevation
  ) {
    elevation
    azimuth
    observable
  }
}
    `;

/**
 * __useGetObservationByIdQuery__
 *
 * To run a query within a React component, call `useGetObservationByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetObservationByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetObservationByIdQuery({
 *   variables: {
 *      tleId: // value for 'tleId'
 *      elevationThreshold: // value for 'elevationThreshold'
 *      gnssLatitude: // value for 'gnssLatitude'
 *      gnssLongitude: // value for 'gnssLongitude'
 *      gnssElevation: // value for 'gnssElevation'
 *   },
 * });
 */
export function useGetObservationByIdQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetObservationByIdQuery, GetObservationByIdQueryVariables> & ({ variables: GetObservationByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetObservationByIdQuery, GetObservationByIdQueryVariables>(GetObservationByIdDocument, options);
      }
export function useGetObservationByIdLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetObservationByIdQuery, GetObservationByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetObservationByIdQuery, GetObservationByIdQueryVariables>(GetObservationByIdDocument, options);
        }
export function useGetObservationByIdSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetObservationByIdQuery, GetObservationByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetObservationByIdQuery, GetObservationByIdQueryVariables>(GetObservationByIdDocument, options);
        }
export type GetObservationByIdQueryHookResult = ReturnType<typeof useGetObservationByIdQuery>;
export type GetObservationByIdLazyQueryHookResult = ReturnType<typeof useGetObservationByIdLazyQuery>;
export type GetObservationByIdSuspenseQueryHookResult = ReturnType<typeof useGetObservationByIdSuspenseQuery>;
export type GetObservationByIdQueryResult = ApolloReactCommon.QueryResult<GetObservationByIdQuery, GetObservationByIdQueryVariables>;
export const GetTlEsByKeywordDocument = gql`
    query getTLEsByKeyword($keyword: String!) {
  getTLEsByKeyword(keyword: $keyword) {
    id
    name
    line_1
    line_2
    epochTime
    createdAt
    updatedAt
    geostationary
  }
}
    `;

/**
 * __useGetTlEsByKeywordQuery__
 *
 * To run a query within a React component, call `useGetTlEsByKeywordQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTlEsByKeywordQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTlEsByKeywordQuery({
 *   variables: {
 *      keyword: // value for 'keyword'
 *   },
 * });
 */
export function useGetTlEsByKeywordQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetTlEsByKeywordQuery, GetTlEsByKeywordQueryVariables> & ({ variables: GetTlEsByKeywordQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetTlEsByKeywordQuery, GetTlEsByKeywordQueryVariables>(GetTlEsByKeywordDocument, options);
      }
export function useGetTlEsByKeywordLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetTlEsByKeywordQuery, GetTlEsByKeywordQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetTlEsByKeywordQuery, GetTlEsByKeywordQueryVariables>(GetTlEsByKeywordDocument, options);
        }
export function useGetTlEsByKeywordSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetTlEsByKeywordQuery, GetTlEsByKeywordQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetTlEsByKeywordQuery, GetTlEsByKeywordQueryVariables>(GetTlEsByKeywordDocument, options);
        }
export type GetTlEsByKeywordQueryHookResult = ReturnType<typeof useGetTlEsByKeywordQuery>;
export type GetTlEsByKeywordLazyQueryHookResult = ReturnType<typeof useGetTlEsByKeywordLazyQuery>;
export type GetTlEsByKeywordSuspenseQueryHookResult = ReturnType<typeof useGetTlEsByKeywordSuspenseQuery>;
export type GetTlEsByKeywordQueryResult = ApolloReactCommon.QueryResult<GetTlEsByKeywordQuery, GetTlEsByKeywordQueryVariables>;
export const ImportTlEsDocument = gql`
    mutation importTLEs($tleData: String!) {
  importTLEs(tleData: $tleData)
}
    `;
export type ImportTlEsMutationFn = ApolloReactCommon.MutationFunction<ImportTlEsMutation, ImportTlEsMutationVariables>;

/**
 * __useImportTlEsMutation__
 *
 * To run a mutation, you first call `useImportTlEsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useImportTlEsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [importTlEsMutation, { data, loading, error }] = useImportTlEsMutation({
 *   variables: {
 *      tleData: // value for 'tleData'
 *   },
 * });
 */
export function useImportTlEsMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ImportTlEsMutation, ImportTlEsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ImportTlEsMutation, ImportTlEsMutationVariables>(ImportTlEsDocument, options);
      }
export type ImportTlEsMutationHookResult = ReturnType<typeof useImportTlEsMutation>;
export type ImportTlEsMutationResult = ApolloReactCommon.MutationResult<ImportTlEsMutation>;
export type ImportTlEsMutationOptions = ApolloReactCommon.BaseMutationOptions<ImportTlEsMutation, ImportTlEsMutationVariables>;
export const UpdateTleByIdDocument = gql`
    mutation updateTLEById($tleId: Int64!, $tleData: String!) {
  updateTLEById(tleId: $tleId, tleData: $tleData)
}
    `;
export type UpdateTleByIdMutationFn = ApolloReactCommon.MutationFunction<UpdateTleByIdMutation, UpdateTleByIdMutationVariables>;

/**
 * __useUpdateTleByIdMutation__
 *
 * To run a mutation, you first call `useUpdateTleByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTleByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTleByIdMutation, { data, loading, error }] = useUpdateTleByIdMutation({
 *   variables: {
 *      tleId: // value for 'tleId'
 *      tleData: // value for 'tleData'
 *   },
 * });
 */
export function useUpdateTleByIdMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateTleByIdMutation, UpdateTleByIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateTleByIdMutation, UpdateTleByIdMutationVariables>(UpdateTleByIdDocument, options);
      }
export type UpdateTleByIdMutationHookResult = ReturnType<typeof useUpdateTleByIdMutation>;
export type UpdateTleByIdMutationResult = ApolloReactCommon.MutationResult<UpdateTleByIdMutation>;
export type UpdateTleByIdMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateTleByIdMutation, UpdateTleByIdMutationVariables>;
export const DeleteTaskByIdDocument = gql`
    mutation deleteTaskById($taskId: Int64!) {
  deleteTaskById(taskId: $taskId)
}
    `;
export type DeleteTaskByIdMutationFn = ApolloReactCommon.MutationFunction<DeleteTaskByIdMutation, DeleteTaskByIdMutationVariables>;

/**
 * __useDeleteTaskByIdMutation__
 *
 * To run a mutation, you first call `useDeleteTaskByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTaskByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTaskByIdMutation, { data, loading, error }] = useDeleteTaskByIdMutation({
 *   variables: {
 *      taskId: // value for 'taskId'
 *   },
 * });
 */
export function useDeleteTaskByIdMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteTaskByIdMutation, DeleteTaskByIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteTaskByIdMutation, DeleteTaskByIdMutationVariables>(DeleteTaskByIdDocument, options);
      }
export type DeleteTaskByIdMutationHookResult = ReturnType<typeof useDeleteTaskByIdMutation>;
export type DeleteTaskByIdMutationResult = ApolloReactCommon.MutationResult<DeleteTaskByIdMutation>;
export type DeleteTaskByIdMutationOptions = ApolloReactCommon.BaseMutationOptions<DeleteTaskByIdMutation, DeleteTaskByIdMutationVariables>;
export const GetData4TasksDocument = gql`
    query getData4Tasks {
  getTotalTasks {
    id
    name
    startTime
    endTime
    hasDone
    createdAt
  }
  getPendingTasks {
    id
    name
    startTime
    endTime
    hasDone
    createdAt
  }
  getGnss {
    timestamp
  }
}
    `;

/**
 * __useGetData4TasksQuery__
 *
 * To run a query within a React component, call `useGetData4TasksQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetData4TasksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetData4TasksQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetData4TasksQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetData4TasksQuery, GetData4TasksQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetData4TasksQuery, GetData4TasksQueryVariables>(GetData4TasksDocument, options);
      }
export function useGetData4TasksLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetData4TasksQuery, GetData4TasksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetData4TasksQuery, GetData4TasksQueryVariables>(GetData4TasksDocument, options);
        }
export function useGetData4TasksSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetData4TasksQuery, GetData4TasksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetData4TasksQuery, GetData4TasksQueryVariables>(GetData4TasksDocument, options);
        }
export type GetData4TasksQueryHookResult = ReturnType<typeof useGetData4TasksQuery>;
export type GetData4TasksLazyQueryHookResult = ReturnType<typeof useGetData4TasksLazyQuery>;
export type GetData4TasksSuspenseQueryHookResult = ReturnType<typeof useGetData4TasksSuspenseQuery>;
export type GetData4TasksQueryResult = ApolloReactCommon.QueryResult<GetData4TasksQuery, GetData4TasksQueryVariables>;