import { Menu, MenuItem } from 'electron';
import { showOpenProjectDialog } from './show-open-project-dialog';
import { getWindow } from './window-manager';

/**
 * Updates the application menu.
 */
export function updateMenu(hasProject: boolean) {
  /**
   * The Electron default application menu.
   */
  const defaultMenu = Menu.getApplicationMenu() || new Menu();

  /**
   * The result menu.
   */
  const menu = new Menu();

  for (const item of defaultMenu.items) {
    switch (item.label) {
      case 'File':
        menu.append(makeFileMenu(hasProject));;
        break;

      case 'Window':
        menu.append(makeWindowMenu(item));
        break;

      default:
        menu.append(item);
    }
  }

  Menu.setApplicationMenu(menu);
}

/**
 * Makes the "File" application menu.
 *
 * @returns The File menu.
 */
function makeFileMenu(hasProject: boolean) {
  const window = getWindow();

  return new MenuItem({
    label: 'File',
    role: 'fileMenu',
    submenu:[
      {
        label: 'Save',
        accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
        click: () => { window.webContents.send('saveMenuItemSelect') }
      },
      {
        label: 'Close Tab',
        accelerator: process.platform === 'darwin' ? 'Cmd+W' : 'Ctrl+W',
        click: () => { window.webContents.send('closeTabMenuItemSelect') }
      },
      hasProject ? {
        label: 'Close Project',
        click: () => {
          updateMenu(false);
          window.webContents.send('closeProjectMenuItemSelect')
        }
      } : {
        label: 'Open Project',
        click: onOpenProjectMenuClick
      },
    ]
  });
}

/**
 * Makes the "Window" application menu from the default menu.
 *
 * This function removes the default Ctrl+W key binding on Windows platform because we override this
 * binding.
 *
 * @param menuItem The Electron default "Window" menu.
 * @return The Window menu item.
 */
function makeWindowMenu(menuItem: MenuItem) {
  if (process.platform !== 'win32' || !Array.isArray(menuItem.submenu?.items)) {
    return menuItem;
  }

  const template = menuItem.submenu.items
    .filter(item => item.label !== 'Close' && item.role !== 'close')
    .map(item => {
      // We must return a plain object template for buildFromTemplate
      return {
        label: item.label,
        role: item.role as any,
        accelerator: item.accelerator,
        click: (item as any).click,
        submenu: item.submenu,
        type: item.type
      };
    });

  // Create a new MenuItem with the new filtered submenu
  return new MenuItem({
    label: menuItem.label,
    submenu: Menu.buildFromTemplate(template)
  });
}

/**
 * Handles open project menu select event.
 */
async function onOpenProjectMenuClick() {
  const window = getWindow();
  const filePath = await showOpenProjectDialog();

  if (filePath) {
    window.webContents.send('openProjectMenuItemSelect', filePath);
  }
}
