// @flow

import {
  types
} from 'pg';

// eslint-disable-next-line id-match
const INT8_OID = 20;
const TIMESTAMPTZ_OID = 1184;
const TIMESTAMP_OID = 1114;

// istanbul ignore next
types.setTypeParser(INT8_OID, (value) => {
  return parseInt(value, 10);
});

// istanbul ignore next
types.setTypeParser(TIMESTAMPTZ_OID, (value) => {
  return value === null ? value : Date.parse(value);
});

// istanbul ignore next
types.setTypeParser(TIMESTAMP_OID, (value) => {
  return value === null ? value : Date.parse(value);
});

export type {
  DatabaseConnectionType,
  DatabasePoolConnectionType,
  DatabasePoolType,
  DatabaseTransactionConnectionType,
  InterceptorType
} from './types';
export {
  createPool
} from './factories';
export {
  createBenchmarkingInterceptor,
  createFieldNameTransformationInterceptor,
  createQueryNormalizationInterceptor
} from './interceptors';
export {
  sql
} from './templateTags';
export {
  CheckIntegrityConstraintViolationError,
  DataIntegrityError,
  ForeignKeyIntegrityConstraintViolationError,
  IntegrityConstraintViolationError,
  NotFoundError,
  NotNullIntegrityConstraintViolationError,
  SlonikError,
  UniqueIntegrityConstraintViolationError
} from './errors';
