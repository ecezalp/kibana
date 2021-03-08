/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { DetectionsPageHelper } from './detections_page_helper';

class CustomQueryRule extends DetectionsPageHelper {
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
      () => this.createRuleStepOne(isA11yTestInProgress, query),
      name,
      description,
      isA11yTestComprehensive
    );
  }

  async createRuleStepOne(isA11yTestInProgress: boolean, query: string): Promise<void> {
    if (isA11yTestInProgress) {
      await this.a11y.testAppSnapshot();
      await this.openImportQueryModal();
      await this.a11y.testAppSnapshot();
      await this.viewTemplatesInImportQueryModal();
      await this.a11y.testAppSnapshot();
      await this.closeImportQueryModal();
    }
    await this.addCustomQuery(query);
    if (isA11yTestInProgress) {
      await this.preview();
      await this.a11y.testAppSnapshot();
    }
    await this.continue('define');
  }

  async openImportQueryModal(): Promise<void> {
    await this.testSubjects.click('importQueryFromSavedTimeline');
    await this.testSubjects.exists('open-timeline-modal-body-filter-default');
  }

  async viewTemplatesInImportQueryModal(): Promise<void> {
    await this._actIfTargetIsMissing(
      'open-timeline-modal-body-filter-template',
      this.openImportQueryModal
    );
    await this._clickAndValidate('open-timeline-modal-body-filter-template', 'timelines-table');
  }

  async closeImportQueryModal(): Promise<void> {
    await this.find.clickByCssSelector('.euiButtonIcon.euiButtonIcon--text.euiModal__closeIcon');
  }
}

export { CustomQueryRule };
