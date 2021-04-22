/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { experimentalFieldMap } from '../experimental_fields/experimental_fields';

interface ECSFieldMap {
  [key: string]: {
    type:
      | 'boolean'
      | 'constant_keyword'
      | 'date'
      | 'float'
      | 'geo_point'
      | 'integer'
      | 'ip'
      | 'keyword'
      | 'long'
      | 'nested'
      | 'scaled_float'
      | 'text'
      | 'object';
    array: boolean;
    required: boolean;
  };
}

export const getFieldMapWithExperimentalFields = (ecsFieldMap: ECSFieldMap) => {
  const eventFieldsCopiedToThreatIndicator = Object.keys(ecsFieldMap).reduce((acc, fieldName) => {
    if (fieldName.startsWith('event.')) {
      const newFieldName = `threat.indicator.${fieldName}`;
      acc[newFieldName] = ecsFieldMap[fieldName];
    }
    return acc;
  }, {} as ECSFieldMap);

  return {
    ...ecsFieldMap,
    ...experimentalFieldMap,
    ...eventFieldsCopiedToThreatIndicator,
  };
};
