import { Button, Menu } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "renderer/redux/store";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import * as Env from "renderer/utils/env";

/**
 * Selectable dimension menu component.
 *
 * @param dimensionId The dimension id.
 * @returns The React UI element.
 */
function DimensionMenu({dimensionId}: {dimensionId: string}) {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const project = useSelector((state: RootState) => state.project);
  const dimension = project.dimensions?.[dimensionId];
  const selectedVariantId = workspace.selectedVariants?.[dimensionId];
  const selectedVariant = project.variants?.[selectedVariantId];

  /**
   * Handles variant select event.
   *
   * @param dimensionId The id of the dimension on which the event occurred.
   * @param variantId The id of the variant that's selected.
   */
  function onSelectVariant(dimensionId: string, variantId?: string) {
    if (!dimensionId) {
      return;
    }

    const selectMap = {...workspace.selectedVariants};
    variantId ? selectMap[dimensionId] = variantId : delete selectMap[dimensionId];
    Env.combine(project, selectMap);
    dispatch(workspaceSlice.actions.selectVariant({dimensionId, variantId}));
  }

  return dimension && (
    <Menu
      withArrow
      offset={1}
    >
      <Menu.Target>
        <Button
          size="compact-xs"
          variant="subtle"
          color="dark"
          radius="lg"
        >
          {dimension.name}: {selectedVariant ? selectedVariant.name : 'None'}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          key=""
          leftSection={
            <IconCheck
              size="1em"
              style={{visibility: selectedVariantId ? 'hidden' : 'visible'}}
            />
          }
          onClick={() => onSelectVariant(dimensionId)}
        >
          None
        </Menu.Item>

        {dimension.variants?.map(variantId => {
          const variant = project.variants?.[variantId];
          return variant ? (
            <Menu.Item
              key={variantId}
              leftSection={
                <IconCheck
                  size="1em"
                  style={{
                    visibility: selectedVariantId === variantId ? 'visible' : 'hidden'
                  }}
                />
              }
              onClick={() => onSelectVariant(dimensionId, variantId)}
            >
              {variant.name}
            </Menu.Item>
          ) : null
        }).filter(item => !!item)}
      </Menu.Dropdown>
    </Menu>
  )
}

/**
 * The UI component that shows a list of selectable dimension.
 */
function Dimensions() {
  const project = useSelector((state: RootState) => state.project);
  const dimensionIds = Array.isArray(project.dimOrder) ? project.dimOrder : [];

  return (
    <>
      {dimensionIds
        .filter(dimensionId => !!project.dimensions?.[dimensionId])
        .map(dimensionId => <DimensionMenu key={dimensionId} dimensionId={dimensionId}/>)
      }
    </>
  )
}

/**
 * The footer UI component
 */
export default function Footer() {
  return (
    <div
      style={{
        flex: '0 0 auto',
        paddingInline: 'var(--mantine-spacing-md)',
        paddingBlock: 'var(--mantine-spacing-xs)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        backgroundColor: 'var(--mantine-color-gray-1)',
        gap: '1em',
      }}
    >
      <Dimensions/>
    </div>
  )
}
