import { Button, Tabs } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from 'renderer/redux/store';
import { workspaceSlice } from 'renderer/redux/workspace-slice';
import RequestForm from './request-form';
import OpenedResourceTab from './opened-resource-tab';
import Variant from './variant';
import { OpenedResource } from 'types/opened-resource';
import './major-tabs.css';

/**
 * Opened resource content component props.
 */
type OpenedResourceContentProps = {openedResource: OpenedResource};

/**
 * The opened resource content component.
 */
function OpenedResourceContent({openedResource}: OpenedResourceContentProps) {
  if (!openedResource) {
    return;
  }

  switch (openedResource.type) {
    case 'request':
      return openedResource.props.request && <RequestForm openedResource={openedResource}/>;

    case 'variant':
      return <Variant openedResource={openedResource}/>;
  }
}

/**
 * The opened resources component.
 */
export default function OpenedResources() {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const openedResources = workspace.openedResources;
  const selectedId = openedResources?.[workspace.selectedResourceIndex]?.id;
  const tabsListRef = useRef<HTMLDivElement>(null);

  /**
   * Scrolls the tabs list to the active tab.
   */
  useEffect(() => {
    scrollToActiveTab();
  }, [selectedId]);

  /**
   * Scrolls the tabs list element to the active tab.
   */
  function scrollToActiveTab() {
    const listElement = tabsListRef.current;

    if (listElement) {
      const tabElement = listElement.querySelector<HTMLElement>('[data-active=true]');

      if (tabElement) {
        tabElement.scrollIntoView({
          behavior: 'smooth',
          inline: 'nearest',
        });
      }
    }
  }

  return openedResources?.length ?
    (
      <Tabs
        variant="none"
        classNames={
          {
          'list': 'major-tabs-list',
          'tab': 'major-tabs-tab'
        }
        }
        value={selectedId}
        onChange={id => dispatch(workspaceSlice.actions.setSelectedTab(id))}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          minHeight: 0,
        }}
      >
        <Tabs.List
          ref={tabsListRef}
          style={{
            flexWrap: 'nowrap',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollbarWidth: 'none', // Hide scrollbar in Firefox
          }}
        >
          {
            openedResources.map((openedResource, index) => (
              <OpenedResourceTab
                key={openedResource.id}
                index={index}
              />
            ))
          }

          <div
            style={{
              position: 'sticky',
              right: 0,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--body-shade-1)',
              zIndex: 1,
            }}
          >
            <Button
              variant="transparent"
              color="dark"
              onClick={() => dispatch(workspaceSlice.actions.newRequest())}
            >
              <IconPlus size="18"/>
            </Button>
          </div>
        </Tabs.List>

        {openedResources.map(openedResource => (
          <Tabs.Panel
            key={openedResource.id}
            value={openedResource.id}
            style={{
              flex: 1,
              minHeight: 0,
            }}
          >
            <OpenedResourceContent openedResource={openedResource}/>
          </Tabs.Panel>
        ))}
      </Tabs>
    ):
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }
      }>
        <Button
          leftSection={<IconPlus/>}
          onClick={() => dispatch(workspaceSlice.actions.newRequest())}
        >
          New Request
        </Button>
      </div>
    )
}
