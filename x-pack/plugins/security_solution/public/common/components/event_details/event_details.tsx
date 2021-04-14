/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiTabbedContent, EuiTabbedContentTab, EuiSpacer } from '@elastic/eui';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { EventFieldsBrowser } from './event_fields_browser';
import { JsonView } from './json_view';
import { ThreatSummaryView } from './threat_summary_view';
import { ThreatDetailsView } from './threat_details_view';
import * as i18n from './translations';
import { AlertSummaryView } from './alert_summary_view';
import { BrowserFields } from '../../containers/source';
import { TimelineEventsDetailsItem } from '../../../../common/search_strategy/timeline';
import { TimelineTabs } from '../../../../common/types/timeline';
import { useThreatIntel } from '../../hooks/use_threat_intel';

interface EventViewTab {
  id: EventViewId;
  name: string;
  content: JSX.Element;
}

export type EventViewId =
  | EventsViewType.tableView
  | EventsViewType.jsonView
  | EventsViewType.summaryView
  | EventsViewType.threatIntelView;
export enum EventsViewType {
  tableView = 'table-view',
  jsonView = 'json-view',
  summaryView = 'summary-view',
  threatIntelView = 'threat-intel-view',
}

interface Props {
  browserFields: BrowserFields;
  data: TimelineEventsDetailsItem[];
  id: string;
  isAlert: boolean;
  timelineTabType: TimelineTabs | 'flyout';
  timelineId: string;
}

const StyledEuiTabbedContent = styled(EuiTabbedContent)`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;

  > [role='tabpanel'] {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: scroll;
    ::-webkit-scrollbar {
      -webkit-appearance: none;
      width: 7px;
    }
    ::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background-color: rgba(0, 0, 0, 0.5);
      -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
    }
  }
`;

const TabContentWrapper = styled.div`
  height: 100%;
  position: relative;
`;

const EventDetailsComponent: React.FC<Props> = ({
  browserFields,
  data,
  id,
  isAlert,
  timelineId,
  timelineTabType,
}) => {
  const [selectedTabId, setSelectedTabId] = useState<EventViewId>(EventsViewType.summaryView);
  const handleTabClick = useCallback(
    (tab: EuiTabbedContentTab) => setSelectedTabId(tab.id as EventViewId),
    [setSelectedTabId]
  );
  const { isThreatPresent, threatCount, threatSummaryRows, threatDetailsRows } = useThreatIntel(
    data,
    isAlert,
    id,
    timelineId,
    selectedTabId
  );

  const summaryTab = useMemo(
    () =>
      isAlert
        ? {
            id: EventsViewType.summaryView,
            name: i18n.SUMMARY,
            content: (
              <>
                <AlertSummaryView
                  {...{
                    data,
                    eventId: id,
                    browserFields,
                    timelineId,
                    title: isThreatPresent ? i18n.ALERT_SUMMARY : undefined,
                  }}
                />
                {isThreatPresent && <ThreatSummaryView threatSummaryRows={threatSummaryRows} />}
              </>
            ),
          }
        : undefined,
    [browserFields, data, id, isAlert, isThreatPresent, timelineId, threatSummaryRows]
  );

  const threatIntelTab = useMemo(
    () =>
      isAlert
        ? {
            id: EventsViewType.threatIntelView,
            name: `${i18n.THREAT_INTEL} (${threatCount})`,
            content: <ThreatDetailsView threatDetailsRows={threatDetailsRows} />,
          }
        : undefined,
    [isAlert, threatDetailsRows, threatCount]
  );

  const tableTab = useMemo(
    () => ({
      id: EventsViewType.tableView,
      name: i18n.TABLE,
      content: (
        <>
          <EuiSpacer size="l" />
          <EventFieldsBrowser
            browserFields={browserFields}
            data={data}
            eventId={id}
            timelineId={timelineId}
            timelineTabType={timelineTabType}
          />
        </>
      ),
    }),
    [browserFields, data, id, timelineId, timelineTabType]
  );

  const jsonTab = useMemo(
    () => ({
      id: EventsViewType.jsonView,
      'data-test-subj': 'jsonViewTab',
      name: i18n.JSON_VIEW,
      content: (
        <>
          <EuiSpacer size="m" />
          <TabContentWrapper>
            <JsonView data={data} />
          </TabContentWrapper>
        </>
      ),
    }),
    [data]
  );

  const tabs = useMemo(() => {
    return [summaryTab, threatIntelTab, tableTab, jsonTab].filter((tab) => !!tab) as EventViewTab[];
  }, [summaryTab, threatIntelTab, tableTab, jsonTab]);

  const selectedTab = useMemo(() => tabs.find((tab) => tab.id === selectedTabId), [
    tabs,
    selectedTabId,
  ]);

  return (
    <StyledEuiTabbedContent
      data-test-subj="eventDetails"
      tabs={tabs}
      selectedTab={selectedTab}
      onTabClick={handleTabClick}
      key="event-summary-tabs"
    />
  );
};

EventDetailsComponent.displayName = 'EventDetailsComponent';

export const EventDetails = React.memo(EventDetailsComponent);
