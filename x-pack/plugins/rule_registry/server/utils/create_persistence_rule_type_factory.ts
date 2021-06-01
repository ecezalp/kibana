/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { ESSearchRequest } from 'typings/elasticsearch';
import { countBy, isEmpty, get } from 'lodash';
import v4 from 'uuid/v4';
import { Logger } from '@kbn/logging';
import type { estypes } from '@elastic/elasticsearch';

import { ElasticsearchClient } from 'kibana/server';
import { AlertInstance } from '../../../alerting/server';
import {
  AlertInstanceContext,
  AlertInstanceState,
  AlertTypeParams,
} from '../../../alerting/common';
import { RuleDataClient } from '../rule_data_client';
import { AlertTypeWithExecutor } from '../types';
import { BuildRuleMessage } from '../../../security_solution/target/types/server/lib/detection_engine/signals/rule_messages';
import { RefreshTypes } from '../../../security_solution/target/types/server/lib/detection_engine/types';
import { BaseHit } from '../../../security_solution/target/types/common/detection_engine/types';
import {
  errorAggregator,
  generateId,
  makeFloatString,
} from '../../../security_solution/target/types/server/lib/detection_engine/signals/utils';
import {
  SearchAfterAndBulkCreateParams,
  SignalHit,
} from '../../../security_solution/target/types/server/lib/detection_engine/signals/types';
import { buildBulkBody } from '../../../security_solution/target/types/server/lib/detection_engine/signals/build_bulk_body';
import { filterDuplicateSignals } from '../../../security_solution/target/types/server/lib/detection_engine/signals/single_bulk_create';

type PersistenceAlertService<TAlertInstanceContext extends Record<string, unknown>> = (
  alerts: Array<Record<string, unknown>>
) => Array<AlertInstance<AlertInstanceState, TAlertInstanceContext, string>>;

type PersistenceAlertQueryService = (
  query: ESSearchRequest
) => Promise<Array<Record<string, unknown>>>;

export interface GenericBulkCreateResponse<T> {
  success: boolean;
  bulkCreateDuration: string;
  createdItemsCount: number;
  createdItems: Array<T & { _id: string; _index: string }>;
  errors: string[];
}

export type WrappedSignalHit = BaseHit<SignalHit>;

type CreatePersistenceRuleTypeFactory = (options: {
  ruleDataClient: RuleDataClient;
  logger: Logger;
}) => <
  TParams extends AlertTypeParams,
  TAlertInstanceContext extends AlertInstanceContext,
  TServices extends {
    alertWithPersistence: PersistenceAlertService<TAlertInstanceContext>;
    findAlerts: PersistenceAlertQueryService;
  }
>(
  type: AlertTypeWithExecutor<TParams, TAlertInstanceContext, TServices>
) => AlertTypeWithExecutor<TParams, TAlertInstanceContext, any>;

const wrapHitsFactory = (
  ruleSO: SearchAfterAndBulkCreateParams['ruleSO'],
  signalsIndex: string
) => (events: Array<estypes.Hit<{ '@timestamp': string }>>) => {
  const wrappedDocs: WrappedSignalHit[] = events.flatMap((doc) => [
    {
      _index: signalsIndex,
      _id: generateId(
        doc._index,
        doc._id,
        doc._version ? doc._version.toString() : '',
        ruleSO.attributes.params.ruleId ?? ''
      ),
      _source: buildBulkBody(ruleSO, doc),
    },
  ]);

  return filterDuplicateSignals(ruleSO.id, wrappedDocs);
};

const getBulkCreateFactory = (logger: Logger, esClient: ElasticsearchClient) => (
  buildRuleMessage: BuildRuleMessage,
  refreshForBulkCreate: RefreshTypes
) => async <T>(wrappedDocs: Array<BaseHit<T>>): Promise<GenericBulkCreateResponse<T>> => {
  if (wrappedDocs.length === 0) {
    return {
      errors: [],
      success: true,
      bulkCreateDuration: '0',
      createdItemsCount: 0,
      createdItems: [],
    };
  }

  const bulkBody = wrappedDocs.flatMap((wrappedDoc) => [
    {
      create: {
        _index: wrappedDoc._index,
        _id: wrappedDoc._id,
      },
    },
    wrappedDoc._source,
  ]);
  const start = performance.now();

  const { body: response } = await esClient.bulk({
    refresh: refreshForBulkCreate,
    body: bulkBody,
  });

  const end = performance.now();
  logger.debug(
    buildRuleMessage(
      `individual bulk process time took: ${makeFloatString(end - start)} milliseconds`
    )
  );
  logger.debug(buildRuleMessage(`took property says bulk took: ${response.took} milliseconds`));
  const createdItems = wrappedDocs
    .map((doc, index) => ({
      _id: response.items[index].create?._id ?? '',
      _index: response.items[index].create?._index ?? '',
      ...doc._source,
    }))
    .filter((_, index) => get(response.items[index], 'create.status') === 201);
  const createdItemsCount = createdItems.length;
  const duplicateSignalsCount = countBy(response.items, 'create.status')['409'];
  const errorCountByMessage = errorAggregator(response, [409]);

  logger.debug(buildRuleMessage(`bulk created ${createdItemsCount} signals`));
  if (duplicateSignalsCount > 0) {
    logger.debug(buildRuleMessage(`ignored ${duplicateSignalsCount} duplicate signals`));
  }
  if (!isEmpty(errorCountByMessage)) {
    logger.error(
      buildRuleMessage(
        `[-] bulkResponse had errors with responses of: ${JSON.stringify(errorCountByMessage)}`
      )
    );
    return {
      errors: Object.keys(errorCountByMessage),
      success: false,
      bulkCreateDuration: makeFloatString(end - start),
      createdItemsCount,
      createdItems,
    };
  } else {
    return {
      errors: [],
      success: true,
      bulkCreateDuration: makeFloatString(end - start),
      createdItemsCount,
      createdItems,
    };
  }
};

export const createPersistenceRuleTypeFactory: CreatePersistenceRuleTypeFactory = ({
  logger,
  ruleDataClient,
}) => (type) => {
  return {
    ...type,
    executor: async (options) => {
      const {
        services: { alertInstanceFactory, scopedClusterClient },
      } = options;

      const currentAlerts: Array<Record<string, unknown>> = [];
      const timestamp = options.startedAt.toISOString();

      const state = await type.executor({
        ...options,
        custom: {
          bulkCreateFactory: getBulkCreateFactory(logger, scopedClusterClient.asCurrentUser),
          wrapHitsFactory,
        },
        services: {
          ...options.services,
          alertWithPersistence: (alerts) => {
            alerts.forEach((alert) => currentAlerts.push(alert));
            return alerts.map((alert) =>
              alertInstanceFactory(alert['kibana.rac.alert.uuid']! as string)
            );
          },
          findAlerts: async (query) => {
            const { body } = await scopedClusterClient.asCurrentUser.search({
              ...query,
              body: {
                ...query.body,
              },
              ignore_unavailable: true,
            });
            return body.hits.hits
              .map((event: { _source: any }) => event._source!)
              .map((event: { [x: string]: any }) => {
                const alertUuid = event['kibana.rac.alert.uuid'];
                const isAlert = alertUuid != null;
                return {
                  ...event,
                  'event.kind': 'signal',
                  'kibana.rac.alert.id': '???',
                  'kibana.rac.alert.status': 'open',
                  'kibana.rac.alert.uuid': v4(),
                  'kibana.rac.alert.ancestors': isAlert
                    ? ((event['kibana.rac.alert.ancestors'] as string[]) ?? []).concat([
                        alertUuid!,
                      ] as string[])
                    : [],
                  'kibana.rac.alert.depth': isAlert
                    ? ((event['kibana.rac.alert.depth'] as number) ?? 0) + 1
                    : 0,
                  '@timestamp': timestamp,
                };
              });
          },
        },
      });

      const numAlerts = currentAlerts.length;
      logger.debug(`Found ${numAlerts} alerts.`);

      if (ruleDataClient && numAlerts) {
        await ruleDataClient.getWriter().bulk({
          body: currentAlerts.flatMap((event) => [{ index: {} }, event]),
        });
      }

      return state;
    },
  };
};
