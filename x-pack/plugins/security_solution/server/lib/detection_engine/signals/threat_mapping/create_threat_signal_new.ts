/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { CreateThreatSignalNewOptions } from './types';
import { SearchAfterAndBulkCreateReturnType } from '../types';
import { buildThreatMappingFilter } from './build_threat_mapping_filter';
import { getFilter } from '../get_filter';
import { searchAfterAndBulkCreateNew } from '../search_after_bulk_create_new';

export const createThreatSignalNew = async ({
  bulkCreate,
  wrapHits,
  alertId,
  buildRuleMessage,
  currentResult,
  currentThreatList,
  eventsTelemetry,
  exceptionItems,
  filters,
  inputIndex,
  language,
  listClient,
  logger,
  outputIndex,
  query,
  refresh,
  savedId,
  searchAfterSize,
  services,
  threatEnrichment,
  threatMapping,
  tuples,
  params,
  type,
}: CreateThreatSignalNewOptions): Promise<SearchAfterAndBulkCreateReturnType> => {
  const threatFilter = buildThreatMappingFilter({
    threatMapping,
    threatList: currentThreatList,
  });

  if (threatFilter.query.bool.should.length === 0) {
    // empty threat list and we do not want to return everything as being
    // a hit so opt to return the existing result.
    logger.debug(
      buildRuleMessage(
        'Indicator items are empty after filtering for missing data, returning without attempting a match'
      )
    );
    return currentResult;
  } else {
    const esFilter = await getFilter({
      type,
      filters: [...filters, threatFilter],
      language,
      query,
      savedId,
      services,
      index: inputIndex,
      lists: exceptionItems,
    });

    logger.debug(
      buildRuleMessage(
        `${threatFilter.query.bool.should.length} indicator items are being checked for existence of matches`
      )
    );

    const result = await searchAfterAndBulkCreateNew({
      bulkCreate,
      wrapHits,
      tuples,
      listClient,
      exceptionsList: exceptionItems,
      params,
      services,
      logger,
      eventsTelemetry,
      id: alertId,
      inputIndexPattern: inputIndex,
      signalsIndex: outputIndex,
      filter: esFilter,
      pageSize: searchAfterSize,
      refresh,
      buildRuleMessage,
      enrichment: threatEnrichment,
    });
    logger.debug(
      buildRuleMessage(
        `${
          threatFilter.query.bool.should.length
        } items have completed match checks and the total times to search were ${
          result.searchAfterTimes.length !== 0 ? result.searchAfterTimes : '(unknown) '
        }ms`
      )
    );
    return result;
  }
};
