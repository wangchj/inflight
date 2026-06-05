import { Tabs, Tooltip } from '@mantine/core';
import { IconHistory, IconSend, IconStack2, type Icon } from "@tabler/icons-react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
import { NavItem, uiSlice } from 'renderer/redux/ui-slice';
import './navbar.css';

/**
 * The NavBar UI component.
 */
export default function NavBar() {
  const dispatch = useDispatch();
  const ui = useSelector((state: RootState) => state.ui);
  const selectedNavItem = ui.selectedNavItem;

  return (
    <Tabs
      defaultValue="gallery"
      orientation="vertical"
      placement="right"
      classNames= {{
        root: 'navbar',
        list: 'navbar-list',
        tab: 'navbar-tab',
      }}
      value={selectedNavItem}
      onChange={value => dispatch(uiSlice.actions.setSelectedNavItem(value as NavItem))}
    >
      <Tabs.List>
        <Item Icon={IconSend} value="requests" label="Requests"/>
        <Item Icon={IconStack2} value="dimensions" label="Dimensions"/>
        <Item Icon={IconHistory} value="history" label="History"/>
      </Tabs.List>
    </Tabs>
  )
}

/**
 * The navbar item UI component.
 *
 * @param Icon Icon component
 * @param value The item identifier
 * @param label The item label
 */
function Item({Icon, value, label}: {Icon: Icon, value: string, label: string}) {
  return (
    <Tooltip label={label} position="right" withArrow openDelay={300}>
      <Tabs.Tab value={value}>
        <div style={{padding: '3px 1px'}}>
          <Icon size="1.2rem"/>
        </div>
      </Tabs.Tab>
    </Tooltip>
  )
}
