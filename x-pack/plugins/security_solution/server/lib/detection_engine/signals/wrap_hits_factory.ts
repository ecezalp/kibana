/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  SearchAfterAndBulkCreateParams,
  SignalSourceHit,
  WrapHits,
  WrappedSignalHit,
} from './types';
import { generateId } from './utils';
import { buildBulkBody } from './build_bulk_body';
import { filterDuplicateSignals } from './filter_duplicate_signals';

export const wrapHitsFactory = ({
  ruleSO,
  signalsIndex,
  isRuleRegistryEnabled,
}: {
  ruleSO: SearchAfterAndBulkCreateParams['ruleSO'];
  signalsIndex: string;
  isRuleRegistryEnabled: boolean;
}): WrapHits => (events) => {
  const wrappedDocs: WrappedSignalHit[] = events.flatMap((doc) => [
    {
      _index: signalsIndex,
      _id: generateId(
        doc._index,
        doc._id,
        doc._version ? doc._version.toString() : '',
        ruleSO.attributes.params.ruleId ?? ''
      ),
      _source: buildBulkBody(ruleSO, doc as SignalSourceHit),
    },
  ]);

  return filterDuplicateSignals(ruleSO.id, wrappedDocs, isRuleRegistryEnabled);
};
