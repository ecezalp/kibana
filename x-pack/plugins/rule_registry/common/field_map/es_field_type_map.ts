/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import * as t from 'io-ts';

export const esFieldTypeMap = {
  boolean: t.boolean,
  byte: t.number,
  date: t.string,
  double: t.number,
  flattened: t.record(t.string, t.array(t.string)),
  float: t.number,
  integer: t.number,
  keyword: t.string,
  long: t.number,
  nested: t.boolean,
  scaled_float: t.number,
  short: t.number,
  text: t.string,
  unsigned_long: t.number,
};
