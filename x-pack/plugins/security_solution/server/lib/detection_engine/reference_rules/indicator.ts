/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {schema} from '@kbn/config-schema';

import {createPersistenceRuleTypeFactory} from '../../../../../rule_registry/server';
import {
  DEFAULT_MAX_SIGNALS,
  DEFAULT_SEARCH_AFTER_PAGE_SIZE,
  INDICATOR_ALERT_TYPE_ID
} from '../../../../common/constants';
import {SecurityRuleRegistry} from '../../../plugin';
import {
  SearchAfterAndBulkCreateReturnType,
} from '../signals/types';
import {getThreatList, getThreatListCount} from '../signals/threat_mapping/get_threat_list';
import {buildThreatEnrichment} from '../signals/threat_mapping/build_threat_enrichment';
import {createThreatSignal} from '../signals/threat_mapping/create_threat_signal';
import chunk from "lodash/fp/chunk";
import {combineConcurrentResults} from "../signals/threat_mapping/utils";
import moment from "moment";
import {getInputIndex} from "../signals/get_input_output_index";
import {CreateThreatSignalOptions} from "../signals/threat_mapping/types";
import {RuleAlertAction} from "../../../../common/detection_engine/types";

const createSecurityIndicatorMatchRuleType = createPersistenceRuleTypeFactory<SecurityRuleRegistry>();

export const indicatorAlertType = createSecurityIndicatorMatchRuleType({
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
    context: [{name: 'server', description: 'the server'}],
  },
  minimumLicenseRequired: 'basic',
  producer: 'security-solution',
  executor: async function ({
                              actions,
                              createdAt,
                              createdBy,
                              enabled,
                              kibanaVersion,
                              name,
                              previousStartedAt,
                              schedule,
                              state,
                              tags,
                              throttle,
                              updatedAt,
                              updatedBy,
                              rule: {
                                id: ruleId}
                              ,
                              startedAt,
                              services: {
                                alertWithPersistence,
                                findAlerts,
                                scopedClusterClient,
                                logger,
                                savedObjectsClient
                              },
                              params: {
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
                              },
                            }) {
    const perPage = concurrentSearches * itemsPerSearch;
    const searchAfterSize = Math.min(maxSignals, DEFAULT_SEARCH_AFTER_PAGE_SIZE);
    const buildRuleMessage = (...messages: string[]) => messages.join();
    const inputIndex = await getInputIndex({savedObjectsClient}, kibanaVersion, [index]);

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
    });

    let threatEnrichment = buildThreatEnrichment({
      esClient: scopedClusterClient.asCurrentUser,
      buildRuleMessage,
      exceptionItems: [],
      logger,
      threatFilters,
      threatIndex,
      threatIndicatorPath,
      threatLanguage,
      threatQuery,
    });

    while (threatList.hits.hits.length !== 0) {
      const chunks = chunk(itemsPerSearch, threatList.hits.hits);
      logger.debug(buildRuleMessage(`${chunks.length} concurrent indicator searches are starting.`));
      const concurrentSearchesPerformed = chunks.map<Promise<SearchAfterAndBulkCreateReturnType>>(
        (slicedChunk) =>
          createThreatSignal({
            // TODO: migrate tuples
            tuples: [{
              from: moment(startedAt).subtract(moment.duration(5, 'm')),
              to: moment(startedAt),
              maxSignals: maxSignals ?? DEFAULT_MAX_SIGNALS
            }],
            threatEnrichment,
            threatMapping: threatMapping as unknown as CreateThreatSignalOptions["threatMapping"],
            query,
            inputIndex,
            type: type as CreateThreatSignalOptions["type"],
            filters: filters || [],
            language: language as CreateThreatSignalOptions["language"],
            savedId,
            services: {savedObjectsClient, scopedClusterClient},
            // TODO: implement exceptions
            exceptionItems: [],
            // TODO: implement lists
            listClient: undefined,
            logger,
            eventsTelemetry,
            alertId: ruleId,
            outputIndex,
            params,
            searchAfterSize,
            actions: actions as RuleAlertAction[],
            createdBy: createdBy ?? "",
            createdAt,
            updatedBy: updatedBy ?? "",
            updatedAt,
            interval,
            enabled,
            tags,
            refresh,
            throttle: throttle ?? "",
            buildRuleMessage,
            name,
            currentThreatList: slicedChunk,
            currentResult: results,
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
  });
