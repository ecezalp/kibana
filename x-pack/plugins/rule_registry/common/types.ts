/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { estypes } from '@elastic/elasticsearch';
import { SearchAfterAndBulkCreateParams } from '../../security_solution/target/types/server/lib/detection_engine/signals/types';
import { BaseHit } from '../../security_solution/target/types/common/detection_engine/types';
import { BuildRuleMessage } from '../../security_solution/target/types/server/lib/detection_engine/signals/rule_messages';
import { RefreshTypes } from '../../security_solution/target/types/server/lib/detection_engine/types';
import {
  GenericBulkCreateResponse,
  WrappedSignalHit,
} from '../server/utils/create_persistence_rule_type_factory';

export type PutIndexTemplateRequest = estypes.PutIndexTemplateRequest & {
  body?: { composed_of?: string[] };
};

export interface ClusterPutComponentTemplateBody {
  template: {
    settings: {
      number_of_shards: number;
    };
    mappings: estypes.TypeMapping;
  };
}

// TODO: move (where?)

export type WrapHits = (
  events: Array<estypes.Hit<{ '@timestamp': string }>>,
  ruleSO: SearchAfterAndBulkCreateParams['ruleSO'],
  signalsIndex: string
) => WrappedSignalHit[];

export type BulkCreate = <T>(
  wrappedDocs: Array<BaseHit<T>>,
  buildRuleMessage: BuildRuleMessage,
  refreshForBulkCreate: RefreshTypes
) => Promise<GenericBulkCreateResponse<T>>;
