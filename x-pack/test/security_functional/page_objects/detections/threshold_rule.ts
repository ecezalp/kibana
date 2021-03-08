/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { DetectionsPageHelper } from './detections_page_helper';

class ThresholdRule extends DetectionsPageHelper {
  constructor(injectedA11y: any, injectedFind: any, injectedTestSubjects: any) {
    super(injectedA11y, injectedFind, injectedTestSubjects);
  }

  async create(
    query: string = '_id',
    name: string = 'test rule',
    description: string = 'test description',
    isA11yTestInProgress: boolean = false,
    isA11yTestComprehensive: boolean = false
  ): Promise<void> {
    await this.createRule(
      async () => await this.createRuleStepOne(isA11yTestInProgress, query),
      name,
      description,
      isA11yTestComprehensive
    );
  }

  async createRuleStepOne(isA11yTestInProgress: boolean, query: string): Promise<void> {
    await this._clickAndValidate('thresholdRuleType', 'mlJobSelect');
    if (isA11yTestInProgress) await this.a11y.testAppSnapshot();
    await this.addCustomQuery(query);
    if (isA11yTestInProgress) {
      await this.preview();
      await this.a11y.testAppSnapshot();
    }
    await this.continue('define');
  }
}

export { ThresholdRule };
