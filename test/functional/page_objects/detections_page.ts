/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
//
// import { FtrProviderContext } from '../ftr_provider_context';
//
// export function DetectionsPageProvider({ getService }: FtrProviderContext) {
//   const find = getService('find');
//   const testSubjects = getService('testSubjects');
//
//   class DetectionsPage {
//     public async navigateHome() {
//       await DetectionsPage._clickAndValidate(
//         'navigation-detections',
//         'manageDetectionRulesButtonExists'
//       );
//     }
//
//     public async navigateToRules() {
//       await DetectionsPage._actIfTargetIsMissing('manage-alert-detection-rules', this.navigateHome);
//       await DetectionsPage._clickAndValidate(
//         'manage-alert-detection-rules',
//         'allRulesTableTab-rules'
//       );
//     }
//
//     public async navigateToRuleMonitoring() {
//       await DetectionsPage._actIfTargetIsMissing(
//         'allRulesTableTab-monitoring',
//         this.navigateToRules
//       );
//       await DetectionsPage._clickAndValidate('allRulesTableTab-monitoring', 'monitoring-table');
//     }
//
//     public async navigateToExceptionList() {
//       await DetectionsPage._actIfTargetIsMissing(
//         'allRulesTableTab-exceptions',
//         this.navigateToRules
//       );
//       await DetectionsPage._clickAndValidate('allRulesTableTab-exceptions', 'exceptions-table');
//     }
//
//     public async navigateToCreateRule() {
//       await DetectionsPage._actIfTargetIsMissing('create-new-rule', this.navigateToRules);
//       await DetectionsPage._clickAndValidate('create-new-rule', 'customRuleType');
//     }
//
//     /*
//      * Creates a custom query rule.
//      * @param testA11y: this is the 'testSnapshot' method on 'a11y' service.
//      * if testA11y argument is present, all variations of the DOM will be produced and tested.
//      */
//     public async createCustomQueryRule(query: string = '_id', testA11y?: () => void) {
//       const isA11yTestInProgress = !!testA11y;
//
//       // navigate to create rule page if not there
//       await DetectionsPage._actIfTargetIsMissing('customRuleType', this.navigateToCreateRule);
//
//       // step 1
//
//       // tests each tab of the import query modal for a11y
//       if (isA11yTestInProgress) {
//         testA11y!();
//
//         // this.createCustomQueryRule_openImportQueryModal()
//         await DetectionsPage._clickAndValidate(
//           'importQueryFromSavedTimeline',
//           'open-timeline-modal-body-filter-default'
//         );
//         testA11y!();
//
//         // this.createCustomQueryRule_viewTemplatesInImportQueryModal()
//         await DetectionsPage._clickAndValidate(
//           'open-timeline-modal-body-filter-template',
//           'timelines-table'
//         );
//         testA11y!();
//
//         // this.createCustomQueryRule_closeImportQueryModal()
//         await find.clickByCssSelector('.euiButtonIcon.euiButtonIcon--text.euiModal__closeIcon');
//       }
//
//       // this.createCustomQueryRule_addCustomQuery(query)
//       const textAreaElement = await testSubjects.find('queryInput');
//       await textAreaElement.type(query);
//
//       // this.createCustomQueryRule_preview()
//       await DetectionsPage._clickAndValidate('queryPreviewButton', 'queryPreviewCustomHistogram');
//       if (isA11yTestInProgress) testA11y!();
//
//       // this.createRule_continue('define');
//       await testSubjects.click(`define-continue`);
//
//       // Step 2
//       // ...
//     }
//
//     public async createCustomQueryRule_openImportQueryModal() {
//       await testSubjects.click('importQueryFromSavedTimeline');
//       await testSubjects.exists('open-timeline-modal-body-filter-default');
//     }
//
//     public async createCustomQueryRule_viewTemplatesInImportQueryModal() {
//       await DetectionsPage._actIfTargetIsMissing(
//         'open-timeline-modal-body-filter-template',
//         this.createCustomQueryRule_openImportQueryModal
//       );
//       await DetectionsPage._clickAndValidate(
//         'open-timeline-modal-body-filter-template',
//         'timelines-table'
//       );
//     }
//
//     public async createCustomQueryRule_closeImportQueryModal() {
//       await find.clickByCssSelector('.euiButtonIcon.euiButtonIcon--text.euiModal__closeIcon');
//     }
//
//     public async createCustomQueryRule_addCustomQuery(query: string) {
//       const textAreaElement = await testSubjects.find('queryInput');
//       await textAreaElement.type(query);
//     }
//
//     public async createCustomQueryRule_addNameAndDescription(name: string, description: string) {
//       const nameInput = await DetectionsPage._getElementByDescription(
//         'detectionEngineStepAboutRuleName'
//       );
//       await nameInput.type(name);
//       const descriptionTextArea = await DetectionsPage._getElementByDescription(
//         'detectionEngineStepAboutRuleName'
//       );
//       await descriptionTextArea.type(description);
//     }
//
//     public async createCustomQueryRule_revealAdvancedSettings() {}
//
//     public async createCustomQueryRule_preview() {
//       await DetectionsPage._clickAndValidate('queryPreviewButton', 'queryPreviewCustomHistogram');
//     }
//
//     public async createRule_continue(prefix: string) {
//       await testSubjects.click(`${prefix}-continue`);
//     }
//
//     private static async _actIfTargetIsMissing(selector: string, callback: () => Promise<void>) {
//       const isElementPresent = await testSubjects.exists(selector);
//       if (!isElementPresent) {
//         await callback();
//       }
//     }
//
//     private static async _clickAndValidate(clickTarget: string, validator: string) {
//       await testSubjects.click(clickTarget);
//       await testSubjects.exists(validator);
//     }
//
//     private static async _getElementByDescription(describedBy: string) {
//       const element = await find.byCssSelector(`[aria-describedby]=${describedBy}`);
//       return element;
//     }
//   }
//
//   return new DetectionsPage();
// }
