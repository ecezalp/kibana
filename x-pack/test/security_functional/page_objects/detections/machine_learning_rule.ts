/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { DetectionsPageHelper } from './detections_page_helper';

class MachineLearningRule extends DetectionsPageHelper {
  constructor(injectedA11y: any, injectedFind: any, injectedTestSubjects: any) {
    super(injectedA11y, injectedFind, injectedTestSubjects);
  }

  async create(
    name: string = 'test rule',
    description: string = 'test description',
    isA11yTestInProgress: boolean = false,
    isA11yTestComprehensive: boolean = false
  ): Promise<void> {
    await this.createRule(
      () => this.createRuleStepOne(isA11yTestInProgress),
      name,
      description,
      isA11yTestComprehensive
    );
  }

  async createRuleStepOne(isA11yTestInProgress: boolean): Promise<void> {
    await this._clickAndValidate('machineLearningRuleType', 'mlJobSelect');
    if (isA11yTestInProgress) await this.a11y.testAppSnapshot();
    await this.selectMachineLearningJob();
    await this.continue('define');
  }

  async selectMachineLearningJob(): Promise<void> {
    const jobDropdown = await this.find.byCssSelector('[data-test-subj="mlJobSelect"] button');
    await jobDropdown.click();
    const firstJob = await this.find.byCssSelector('#high_distinct_count_error_message');
    await firstJob.click();
  }
}

export { MachineLearningRule };
