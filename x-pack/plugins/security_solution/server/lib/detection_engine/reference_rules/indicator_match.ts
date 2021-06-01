/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import chunk from 'lodash/fp/chunk';
import moment from 'moment';

import { schema } from '@kbn/config-schema';
import { Logger } from '@kbn/logging';

import {
  RuleDataClient,
  createPersistenceRuleTypeFactory,
} from '../../../../../rule_registry/server';
import {
  DEFAULT_MAX_SIGNALS,
  DEFAULT_SEARCH_AFTER_PAGE_SIZE,
  INDICATOR_ALERT_TYPE_ID,
} from '../../../../common/constants';
import { SearchAfterAndBulkCreateReturnType } from '../signals/types';
import { getThreatList, getThreatListCount } from '../signals/threat_mapping/get_threat_list';
import { buildThreatEnrichment } from '../signals/threat_mapping/build_threat_enrichment';
import { CreateThreatSignalOptions } from '../signals/threat_mapping/types';
import { createThreatSignalNew } from '../signals/threat_mapping/create_threat_signal_new';
import { combineConcurrentResults } from '../signals/threat_mapping/utils';

export const createIndicatorMatchAlertType = (ruleDataClient: RuleDataClient, logger: Logger) => {
  const createPersistenceRuleType = createPersistenceRuleTypeFactory({
    ruleDataClient,
    logger,
  });
  return createPersistenceRuleType({
    id: INDICATOR_ALERT_TYPE_ID,
    name: 'Indicator Match Rule',
    validate: {
      params: schema.object({
        concurrentSearches: schema.number(),
        index: schema.string(),
        filters: schema.arrayOf(schema.any()),
        itemsPerSearch: schema.number(),
        language: schema.string(),
        maxSignals: schema.number(),
        name: schema.string(),
        outputIndex: schema.string(),
        query: schema.string(),
        savedId: schema.string(),
        threatFilters: schema.any(),
        threatIndex: schema.arrayOf(schema.string()),
        threatIndicatorPath: schema.string(),
        threatMapping: schema.arrayOf(
          schema.object({
            field: schema.string(),
            type: schema.string(),
            value: schema.string(),
          })
        ),
        threatLanguage: schema.string(),
        threatQuery: schema.string(),
        type: schema.string(),
      }),
    },
    actionGroups: [
      {
        id: 'default',
        name: 'Default',
      },
    ],
    defaultActionGroupId: 'default',
    actionVariables: {
      context: [{ name: 'server', description: 'the server' }],
    },
    minimumLicenseRequired: 'basic',
    producer: 'security-solution',
    async executor({
      name,
      previousStartedAt,
      state,
      tags,
      alertId: ruleId,
      rule: { actions, createdAt, throttle, updatedAt, updatedBy, enabled, schedule, createdBy },
      startedAt,
      services: { alertWithPersistence, findAlerts, scopedClusterClient, savedObjectsClient },
      custom: { wrapHitsFactory, bulkCreateFactory },
      params,
    }) {
      const {
        concurrentSearches,
        filters,
        index,
        itemsPerSearch,
        language,
        maxSignals,
        query,
        outputIndex,
        savedId,
        threatFilters,
        threatIndex,
        threatIndicatorPath,
        threatLanguage,
        threatMapping,
        threatQuery,
        type,
      } = params;
      const perPage = concurrentSearches * itemsPerSearch;
      const searchAfterSize = Math.min(maxSignals, DEFAULT_SEARCH_AFTER_PAGE_SIZE);
      const buildRuleMessage = (...messages: string[]) => messages.join();

      // TODO: verify
      const inputIndex = index;

      // setup wrapHits & bulkCreate
      const refreshForBulkCreate = actions.length ? 'wait_for' : false;
      const bulkCreate = bulkCreateFactory(buildRuleMessage, refreshForBulkCreate);
      const wrapHits = wrapHitsFactory({ attributes: { params } }, inputIndex);

      let results: SearchAfterAndBulkCreateReturnType = {
        success: true,
        warning: false,
        bulkCreateTimes: [],
        searchAfterTimes: [],
        lastLookBackDate: null,
        createdSignalsCount: 0,
        createdSignals: [],
        errors: [],
      };

      let threatListCount = getThreatListCount({
        esClient: scopedClusterClient.asCurrentUser,
        exceptionItems: [],
        threatFilters,
        query: threatQuery,
        language: threatLanguage,
        index: threatIndex,
      });

      let threatList = await getThreatList({
        esClient: scopedClusterClient.asCurrentUser,
        exceptionItems: [],
        threatFilters,
        query: threatQuery,
        language: threatLanguage,
        index: threatIndex,
        searchAfter: undefined,
        sortField: undefined,
        sortOrder: undefined,
        logger,
        buildRuleMessage,
        perPage,
        listClient: undefined,
      });

      const threatEnrichment = buildThreatEnrichment({
        esClient: scopedClusterClient.asCurrentUser,
        buildRuleMessage,
        exceptionItems: [],
        logger,
        threatFilters,
        threatIndex,
        threatIndicatorPath,
        threatLanguage,
        threatQuery,
        listClient: undefined,
      });

      while (threatList.hits.hits.length !== 0) {
        const chunks = chunk(itemsPerSearch, threatList.hits.hits);
        logger.debug(
          buildRuleMessage(`${chunks.length} concurrent indicator searches are starting.`)
        );
        const concurrentSearchesPerformed = chunks.map<Promise<SearchAfterAndBulkCreateReturnType>>(
          (slicedChunk) =>
            createThreatSignalNew({
              bulkCreate,
              wrapHits,
              alertId: ruleId,
              buildRuleMessage,
              currentResult: results,
              currentThreatList: slicedChunk,
              eventsTelemetry: undefined,
              exceptionItems: [],
              filters: filters || [],
              inputIndex: [inputIndex],
              language: language as CreateThreatSignalOptions['language'],
              listClient: undefined,
              refresh: actions.length ? 'wait_for' : false,
              params,
              logger,
              outputIndex,
              query,
              savedId,
              searchAfterSize,
              services: { savedObjectsClient, scopedClusterClient },
              threatEnrichment,
              threatMapping: (threatMapping as unknown) as CreateThreatSignalOptions['threatMapping'],
              // TODO: migrate tuples
              tuples: [
                {
                  from: moment(startedAt).subtract(moment.duration(5, 'm')),
                  to: moment(startedAt),
                  maxSignals: maxSignals ?? DEFAULT_MAX_SIGNALS,
                },
              ],
              type: type as CreateThreatSignalOptions['type'],
            })
        );
        const searchesPerformed = await Promise.all(concurrentSearchesPerformed);
        results = combineConcurrentResults(results, searchesPerformed);
        threatListCount -= threatList.hits.hits.length;
        logger.debug(
          buildRuleMessage(
            `Concurrent indicator match searches completed with ${results.createdSignalsCount} signals found`,
            `search times of ${results.searchAfterTimes}ms,`,
            `bulk create times ${results.bulkCreateTimes}ms,`,
            `all successes are ${results.success}`
          )
        );
        if (results.createdSignalsCount >= maxSignals) {
          logger.debug(
            buildRuleMessage(
              `Indicator match has reached its max signals count ${maxSignals}. Additional indicator items not checked are ${threatListCount}`
            )
          );
          break;
        }
        logger.debug(buildRuleMessage(`Indicator items left to check are ${threatListCount}`));

        threatList = await getThreatList({
          esClient: scopedClusterClient.asCurrentUser,
          exceptionItems: [],
          query: threatQuery,
          language: threatLanguage,
          threatFilters,
          index: threatIndex,
          // @ts-expect-error@elastic/elasticsearch SortResults might contain null
          searchAfter: threatList.hits.hits[threatList.hits.hits.length - 1].sort,
          sortField: undefined,
          sortOrder: undefined,
          listClient: undefined,
          buildRuleMessage,
          logger,
          perPage,
        });
      }

      logger.debug(buildRuleMessage('Indicator matching rule has completed'));
      return results;
    },
  });
};
