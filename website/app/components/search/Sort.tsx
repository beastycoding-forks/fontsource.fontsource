import { Dropdown, IconGrid, IconList } from '@components';
import {
  Center,
  createStyles,
  Group,
  Menu,
  SegmentedControl,
  Text,
  Tooltip,
} from '@mantine/core';
import { useAtom } from 'jotai';

import { displayAtom, sortAtom } from './atoms';

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: 'flex',
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '10px',
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.background[4]
        : theme.colors.background[0],

    '&:focus-within': {
      borderBottomColor: theme.colors.purple[0],
    },
  },

  displayGroup: {
    display: 'flex',

    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      display: 'none',
    },
  },

  control: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.button[1]
        : theme.colors.button[0],
    borderRadius: '6px',

    label: {
      padding: '5px',
    },
  },
}));

interface SortItemProps {
  value: string;
  setState: (value: any) => void;
}

const SortItem = ({ value, setState }: SortItemProps) => {
  return (
    <Menu.Item style={{ width: '100%' }} onClick={() => setState(value)}>
      {value}
    </Menu.Item>
  );
};

interface SortProps {
  count: number;
}

const Sort = ({ count }: SortProps) => {
  const { classes } = useStyles();
  const [sortOrder, setSortOrder] = useAtom(sortAtom);
  const [display, setDisplay] = useAtom(displayAtom);
  return (
    <div className={classes.wrapper}>
      <Text>{count} families loaded</Text>
      <Group>
        <Dropdown label={sortOrder} width={150}>
          <SortItem value="Most Popular" setState={setSortOrder} />
          <SortItem value="Newest" setState={setSortOrder} />
          <SortItem value="Name" setState={setSortOrder} />
          <SortItem value="Random" setState={setSortOrder} />
        </Dropdown>
        <Group className={classes.displayGroup}>
          <Text size={15}>Display</Text>
          <Tooltip label={display === 'grid' ? 'Grid' : 'List'} openDelay={600} closeDelay={100}>
            <SegmentedControl
              className={classes.control}
              value={display}
              onChange={setDisplay as (value: string) => void}
              data={[
                {
                  label: (
                    <Center>
                      <IconGrid height={20} active={display === 'grid'} />
                    </Center>
                  ),
                  value: 'grid',
                },
                {
                  label: (
                    <Center>
                      <IconList height={20} active={display === 'list'} />
                    </Center>
                  ),
                  value: 'list',
                },
              ]}
            />
          </Tooltip>
        </Group>
      </Group>
    </div>
  );
};

export { Sort };