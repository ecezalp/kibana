/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export const experimentalFieldMap = {
  'as.number': {
    type: 'long',
    array: false,
    required: false,
  },
  'as.organization.name': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'code_signature.exists': {
    type: 'boolean',
    array: false,
    required: false,
  },
  'code_signature.status': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'code_signature.subject_name': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'code_signature.trusted': {
    type: 'boolean',
    array: false,
    required: false,
  },
  'code_signature.valid': {
    type: 'boolean',
    array: false,
    required: false,
  },
  'geo.city_name': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'geo.continent_name': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'geo.country_iso_code': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'geo.country_name': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'geo.location': {
    type: 'geo_point',
    array: false,
    required: false,
  },
  'geo.name': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'geo.region_iso_code': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'geo.region_name': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'hash.md5': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'hash.sha1': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'hash.sha256': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'hash.sha512': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'interface.alias': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'interface.id': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'interface.name': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'os.family': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'os.full': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'os.kernel': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'os.name': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'os.platform': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'os.version': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'pe.company': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'pe.description': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'pe.file_version': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'pe.original_file_name': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'pe.product': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator': {
    type: 'nested',
    array: false,
    required: false,
  },
  'threat.indicator.as.number': {
    type: 'long',
    array: false,
    required: false,
  },
  'threat.indicator.as.organization.name': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.confidence': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.dataset': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.description': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.domain': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.email.address': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.first_seen': {
    type: 'date',
    array: false,
    required: false,
  },
  'threat.indicator.geo.city_name': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.geo.continent_name': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.geo.country_iso_code': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.geo.country_name': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.geo.location': {
    type: 'geo_point',
    array: false,
    required: false,
  },
  'threat.indicator.geo.name': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.geo.region_iso_code': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.geo.region_name': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.ip': {
    type: 'ip',
    array: false,
    required: false,
  },
  'threat.indicator.last_seen': {
    type: 'date',
    array: false,
    required: false,
  },
  'threat.indicator.marking.tlp': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.matched.atomic': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.matched.field': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.matched.type': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.module': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.port': {
    type: 'long',
    array: false,
    required: false,
  },
  'threat.indicator.provider': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'threat.indicator.scanner_stats': {
    type: 'long',
    array: false,
    required: false,
  },
  'threat.indicator.sightings': {
    type: 'long',
    array: false,
    required: false,
  },
  'threat.indicator.type': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'vlan.id': {
    type: 'keyword',
    array: false,
    required: false,
  },
  'vlan.name': {
    type: 'keyword',
    array: false,
    required: false,
  },
};
