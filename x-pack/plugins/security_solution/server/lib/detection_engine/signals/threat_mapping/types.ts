/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { estypes } from '@elastic/elasticsearch';
import type {
  ThreatQuery,
  ThreatMapping,
  ThreatMappingEntries,
  ThreatIndex,
  ThreatLanguageOrUndefined,
  ConcurrentSearches,
  ItemsPerSearch,
  ThreatIndicatorPathOrUndefined,
  LanguageOrUndefined,
  Type,
} from '@kbn/securitysolution-io-ts-alerting-types';
import type { ExceptionListItemSchema } from '@kbn/securitysolution-io-ts-list-types';
import { ListClient } from '../../../../../../lists/server';
import {
  AlertInstanceContext,
  AlertInstanceState,
  AlertServices,
} from '../../../../../../alerting/server';
import { ElasticsearchClient, Logger, SavedObject } from '../../../../../../../../src/core/server';
import { TelemetryEventsSender } from '../../../telemetry/sender';
import { BuildRuleMessage } from '../rule_messages';
import {
  AlertAttributes,
  RuleRangeTuple,
  SearchAfterAndBulkCreateReturnType,
  SignalsEnrichment,
} from '../types';
import { ThreatRuleParams } from '../../schemas/rule_schemas';
import { BulkCreate, WrapHits } from '../../../../../../rule_registry/common/types';

export type SortOrderOrUndefined = 'asc' | 'desc' | undefined;

export interface CreateThreatSignalsOptions {
  tuples: RuleRangeTuple[];
  threatMapping: ThreatMapping;
  query: string;
  inputIndex: string[];
  type: Type;
  filters: unknown[];
  language: LanguageOrUndefined;
  savedId: string | undefined;
  services: Partial<AlertServices<AlertInstanceState, AlertInstanceContext, 'default'>>;
  exceptionItems: ExceptionListItemSchema[];
  listClient: ListClient | undefined;
  logger: Logger;
  eventsTelemetry: TelemetryEventsSender | undefined;
  alertId: string;
  outputIndex: string;
  ruleSO: SavedObject<AlertAttributes<ThreatRuleParams>>;
  searchAfterSize: number;
  refresh: false | 'wait_for';
  threatFilters: unknown[];
  threatQuery: ThreatQuery;
  buildRuleMessage: BuildRuleMessage;
  threatIndex: ThreatIndex;
  threatIndicatorPath: ThreatIndicatorPathOrUndefined;
  threatLanguage: ThreatLanguageOrUndefined;
  concurrentSearches: ConcurrentSearches;
  itemsPerSearch: ItemsPerSearch;
}

export interface CreateThreatSignalOptions {
  tuples: RuleRangeTuple[];
  threatMapping: ThreatMapping;
  threatEnrichment: SignalsEnrichment;
  query: string;
  inputIndex: string[];
  type: Type;
  filters: unknown[];
  language: LanguageOrUndefined;
  savedId: string | undefined;
  services: AlertServices<AlertInstanceState, AlertInstanceContext, 'default'>;
  exceptionItems: ExceptionListItemSchema[];
  listClient: ListClient;
  logger: Logger;
  eventsTelemetry: TelemetryEventsSender | undefined;
  alertId: string;
  outputIndex: string;
  ruleSO: SavedObject<AlertAttributes<ThreatRuleParams>>;
  searchAfterSize: number;
  refresh: false | 'wait_for';
  buildRuleMessage: BuildRuleMessage;
  currentThreatList: ThreatListItem[];
  currentResult: SearchAfterAndBulkCreateReturnType;
}

export interface CreateThreatSignalNewOptions {
  wrapHits: WrapHits;
  bulkCreate: BulkCreate;
  tuples: RuleRangeTuple[];
  threatMapping: ThreatMapping;
  threatEnrichment: SignalsEnrichment;
  query: string;
  inputIndex: string[];
  type: Type;
  filters: unknown[];
  language: LanguageOrUndefined;
  savedId: string | undefined;
  services: Partial<AlertServices<AlertInstanceState, AlertInstanceContext, 'default'>>;
  exceptionItems: ExceptionListItemSchema[];
  listClient: ListClient | undefined;
  logger: Logger;
  eventsTelemetry: TelemetryEventsSender | undefined;
  alertId: string;
  outputIndex: string;
  params: Partial<AlertAttributes<ThreatRuleParams>>;
  searchAfterSize: number;
  refresh: false | 'wait_for';
  buildRuleMessage: BuildRuleMessage;
  currentThreatList: ThreatListItem[];
  currentResult: SearchAfterAndBulkCreateReturnType;
}

export interface BuildThreatMappingFilterOptions {
  threatMapping: ThreatMapping;
  threatList: ThreatListItem[];
  chunkSize?: number;
}

export interface FilterThreatMappingOptions {
  threatMapping: ThreatMapping;
  threatListItem: ThreatListItem;
}

export interface CreateInnerAndClausesOptions {
  threatMappingEntries: ThreatMappingEntries;
  threatListItem: ThreatListItem;
}

export interface CreateAndOrClausesOptions {
  threatMapping: ThreatMapping;
  threatListItem: ThreatListItem;
}

export interface BuildEntriesMappingFilterOptions {
  threatMapping: ThreatMapping;
  threatList: ThreatListItem[];
  chunkSize: number;
}

export interface SplitShouldClausesOptions {
  should: BooleanFilter[];
  chunkSize: number;
}

export interface BooleanFilter {
  bool: { should: unknown[]; minimum_should_match: number };
}

export interface GetThreatListOptions {
  esClient: ElasticsearchClient;
  query: string;
  language: ThreatLanguageOrUndefined | string;
  index: string[];
  perPage?: number;
  searchAfter: string[] | undefined;
  sortField: string | undefined;
  sortOrder: SortOrderOrUndefined;
  threatFilters: unknown[];
  exceptionItems: ExceptionListItemSchema[];
  listClient: ListClient | undefined;
  buildRuleMessage: BuildRuleMessage;
  logger: Logger;
}

export interface ThreatListCountOptions {
  esClient: ElasticsearchClient;
  query: string;
  language: ThreatLanguageOrUndefined | string;
  threatFilters: unknown[];
  index: string[];
  exceptionItems: ExceptionListItemSchema[];
}

export interface GetSortWithTieBreakerOptions {
  sortField: string | undefined;
  sortOrder: SortOrderOrUndefined;
  index: string[];
  listItemIndex: string | undefined;
}

export interface ThreatListDoc {
  [key: string]: unknown;
}

/**
 * This is an ECS document being returned, but the user could return or use non-ecs based
 * documents potentially.
 */
export type ThreatListItem = estypes.Hit<ThreatListDoc>;

export interface ThreatIndicator {
  [key: string]: unknown;
}

export interface SortWithTieBreaker {
  [key: string]: string;
}

export interface ThreatMatchNamedQuery {
  id: string;
  index: string;
  field: string;
  value: string;
}

export type GetMatchedThreats = (ids: string[]) => Promise<ThreatListItem[]>;

export interface BuildThreatEnrichmentOptions {
  buildRuleMessage: BuildRuleMessage;
  exceptionItems: ExceptionListItemSchema[];
  listClient: ListClient | undefined;
  logger: Logger;
  esClient: ElasticsearchClient;
  threatFilters: unknown[];
  threatIndex: ThreatIndex;
  threatIndicatorPath: ThreatIndicatorPathOrUndefined;
  threatLanguage: ThreatLanguageOrUndefined | string;
  threatQuery: ThreatQuery;
}
