/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { DetectionsPageHelper } from './detections_page_helper';
import { WebElementWrapper } from '../../../../../test/functional/services/lib/web_element_wrapper';

class EventCorrelationRule extends DetectionsPageHelper {
  constructor(injectedA11y: any, injectedFind: any, injectedTestSubjects: any) {
    super(injectedA11y, injectedFind, injectedTestSubjects);
  }

  async create(
    query: string = 'any where true',
    name: string = 'test rule',
    description: string = 'test description',
    isA11yTestInProgress: boolean = false,
    isA11yTestComprehensive: boolean = false
  ): Promise<void> {
    await this.createRule(
      () => this.createRuleStepOne(isA11yTestInProgress, query),
      name,
      description,
      isA11yTestComprehensive
    );
  }

  async createRuleStepOne(isA11yTestInProgress: boolean, query: string): Promise<void> {
    await this._clickAndValidate('eqlRuleType', 'eqlQueryBarTextInput');
    if (isA11yTestInProgress) await this.a11y.testAppSnapshot();
    await this.replaceIndexPattern();
    await this.addEqlQuery(query);
    await this.preview();
    await this.continue('define');
  }

  async addEqlQuery(query: string): Promise<void> {
    const textArea = await this.find.byCssSelector(
      '[data-test-subj="detectionEngineStepDefineRuleEqlQueryBar"] [data-test-subj="eqlQueryBarTextInput"]'
    );
    await textArea.type(query);
  }

  async replaceIndexPattern(): Promise<void> {
    const buttons = await this.find.allByCssSelector('[data-test-subj="comboBoxInput"] button');
    await buttons.map(async (button: WebElementWrapper) => await button.click());
    const input = await this.find.byCssSelector('input[data-test-subj="comboBoxSearchInput"]');
    await input.type('*');
  }
}

export { EventCorrelationRule };
